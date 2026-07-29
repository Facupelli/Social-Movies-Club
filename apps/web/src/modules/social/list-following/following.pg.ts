import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import { follows, userProfiles } from '@/platform/database/postgres/schema';
import type { FollowingUser } from './following.types';

export async function listFollowingUsers(
  userId: string,
  viewerUserId: string
): Promise<FollowingUser[]> {
  return await withDatabase(async (db) => {
    const { rows } = await db.execute<FollowingUser>(sql`
      SELECT
        f.followee_id AS "followeeId",
        p.user_id AS "userId",
        p.display_name AS "userName",
        p.username AS "userUsername",
        p.avatar_url AS "userImage",
        EXISTS (
          SELECT 1
          FROM ${follows} AS viewer_follow
          WHERE viewer_follow.follower_id = ${viewerUserId}
            AND viewer_follow.followee_id = f.followee_id
        ) AS "isFollowing"
      FROM ${follows} AS f
      JOIN ${userProfiles} AS p ON f.followee_id = p.user_id
      WHERE f.follower_id = ${userId}
      ORDER BY LOWER(p.display_name), p.user_id;
    `);

    return rows;
  });
}
