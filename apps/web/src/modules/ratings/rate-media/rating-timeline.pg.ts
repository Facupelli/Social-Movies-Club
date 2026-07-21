import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import { feedItems } from '@/platform/database/postgres/schema';
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

        feedItemsCreated = followersToProcess.length;
      }

      // biome-ignore lint/suspicious/noConsole: preserve fan-out diagnostics
      console.log(
        `📢 Created ${feedItemsCreated} feed items for rating ${rating.id}`
      );
    });
  });
}
