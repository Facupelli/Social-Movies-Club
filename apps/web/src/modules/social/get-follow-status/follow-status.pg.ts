import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import { follows } from '@/platform/database/postgres/schema';

export async function getFollowStatus(
  userId: string,
  followedUserId: string
): Promise<boolean> {
  return await withDatabase(async (db) => {
    const { rows } = await db.execute<{ isFollowing: boolean }>(sql`
      SELECT EXISTS (
        SELECT 1
        FROM ${follows} AS f
        WHERE f.follower_id = ${userId}
          AND f.followee_id = ${followedUserId}
      ) AS "isFollowing"
    `);

    return rows[0]?.isFollowing ?? false;
  });
}
