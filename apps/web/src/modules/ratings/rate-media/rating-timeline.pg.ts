import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import {
  feedItemRatings,
  feedItems,
  feedMediaBucket,
} from '@/platform/database/postgres/schema';
import type { PersistedRating } from './rating.pg';

const MAX_FOLLOWERS_TO_FANOUT = 1000;

export async function fanOutRatingToFollowerTimelines(
  rating: PersistedRating
): Promise<void> {
  await withDatabase(async (db) => {
    await db.transaction(async (tx) => {
      const { rows: followers } = await tx.execute<{
        follower_id: string;
      }>(sql`
          SELECT follower_id
          FROM follows
          WHERE followee_id = ${rating.user_id}
          LIMIT ${MAX_FOLLOWERS_TO_FANOUT + 1}
        `);

      const followersSkipped = Math.max(
        0,
        followers.length - MAX_FOLLOWERS_TO_FANOUT
      );
      const followersToProcess = followers.slice(0, MAX_FOLLOWERS_TO_FANOUT);

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
                  sql`(${follower.follower_id}, ${rating.user_id}, ${rating.id})`
              ),
              sql`, `
            )}
          `);

        const { rows: bucketResults } = await tx.execute<{ id: string }>(sql`
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
    });
  });
}
