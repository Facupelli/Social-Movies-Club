import { waitUntil } from '@vercel/functions';
import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import {
  feedItemRatings,
  feedItems,
  feedMediaBucket,
  ratings,
} from '@/platform/database/postgres/schema';

const MAX_FOLLOWERS_TO_FANOUT = 1000;

export class RatingPgRepository {
  async rateMovieWithQueue(
    userId: string,
    movieId: bigint,
    score: number,
    watchedDate: string
  ): Promise<void> {
    return await withDatabase(async (db) => {
      const createRatingQuery = sql`
          INSERT INTO ${ratings}
            (user_id, media_id, score, watched_date, created_at)
          VALUES
            (${userId}, ${movieId}, ${score}, ${watchedDate}, now())
          ON CONFLICT (user_id, media_id)
          DO UPDATE SET
            score = EXCLUDED.score,
            created_at = now()
          RETURNING id, user_id, media_id, score, created_at
        `;

      const ratingResult = await db.execute<{
        id: string;
        user_id: string;
        media_id: string;
        score: number;
        created_at: Date;
      }>(createRatingQuery);

      const rating = ratingResult.rows[0];
      // biome-ignore lint: debugin logs
      console.log(`✅ Rating created/updated: ${rating.id}`);

      const queueServiceUrl = process.env.QUEUE_SERVICE_URL;
      const response = await fetch(`${queueServiceUrl}/feed-item/process`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          userId,
          ratingId: rating.id,
        }),
      });

      // biome-ignore lint: debugin logs
      console.log(`Rating-Job posted to queue service: ${response.ok}`);
    });
  }

  // Use this method until the queue-system app is deployed.
  async rateMovie(
    userId: string,
    movieId: string,
    score: number,
    watchedDate: string
  ): Promise<void> {
    return await withDatabase(async (db) => {
      const createRatingQuery = sql`
          INSERT INTO ${ratings}
            (user_id, media_id, score, watched_date, created_at)
          VALUES
            (${userId}, ${movieId}, ${score}, ${watchedDate}, now())
          ON CONFLICT (user_id, media_id)
          DO UPDATE SET
            score = EXCLUDED.score,
            created_at = now()
          RETURNING id, user_id, media_id, score, created_at
        `;

      const ratingResult = await db.execute<{
        id: string;
        user_id: string;
        media_id: string;
        score: number;
        created_at: Date;
      }>(createRatingQuery);

      const rating = ratingResult.rows[0];
      // biome-ignore lint: debugin logs
      console.log(`✅ Rating created/updated: ${rating.id}`);

      waitUntil(
        db.transaction(async (tx) => {
          const { rows: followers } = await tx.execute<{
            follower_id: string;
          }>(sql`
            SELECT follower_id
            FROM follows
            WHERE followee_id = ${userId}
            LIMIT ${MAX_FOLLOWERS_TO_FANOUT + 1}
          `);

          const followersSkipped = Math.max(
            0,
            followers.length - MAX_FOLLOWERS_TO_FANOUT
          );
          const followersToProcess = followers.slice(
            0,
            MAX_FOLLOWERS_TO_FANOUT
          );

          if (followersSkipped > 0) {
            // biome-ignore lint/suspicious/noConsole: preserve fan-out diagnostics
            console.warn(
              `⚠️  Skipping ${followersSkipped} followers for rating ${rating.id} (over limit)`
            );
          }

          let feedItemsCreated = 0;
          if (followersToProcess.length > 0) {
            await tx.execute(sql`
							INSERT INTO ${feedItems} (user_id, actor_id, rating_id)
							VALUES ${sql.join(
                followersToProcess.map(
                  (follower) =>
                    sql`(${follower.follower_id}, ${userId}, ${rating.id})`
                ),
                sql`, `
              )}
       			`);

            const { rows: bucketResults } = await tx.execute<{
              id: string;
            }>(sql`
							INSERT INTO ${feedMediaBucket} (user_id, media_id, rating_count)
							VALUES ${sql.join(
                followersToProcess.map(
                  (follower) =>
                    sql`(${follower.follower_id}, ${rating.media_id}, 1)`
                ),
                sql`, `
              )}
						  ON CONFLICT (user_id, media_id)
							DO UPDATE SET
								rating_count = ${feedMediaBucket.ratingCount} + 1,
								last_rating_at = now()
							RETURNING id, user_id
						`);

            if (bucketResults.length > 0) {
              await tx.execute(sql`
								INSERT INTO ${feedItemRatings} (aggregated_feed_item_id, rating_id, added_at)
								VALUES ${sql.join(
                  bucketResults.map(
                    (bucket) => sql`(${bucket.id}, ${rating.id}, now())`
                  ),
                  sql`, `
                )}
							ON CONFLICT (aggregated_feed_item_id, rating_id) DO NOTHING
						`);
            }

            feedItemsCreated = followersToProcess.length;
          }

          // biome-ignore lint/suspicious/noConsole: preserve fan-out diagnostics
          console.log(
            `📢 Created ${feedItemsCreated} feed items for rating ${rating.id}`
          );
        })
      );
    });
  }
}
