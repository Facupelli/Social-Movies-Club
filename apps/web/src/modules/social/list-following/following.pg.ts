import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import { follows, users } from '@/platform/database/postgres/schema';
import type { FollowingUser } from './following.types';

export async function listFollowingUsers(
  userId: string,
  viewerUserId: string
): Promise<FollowingUser[]> {
  return await withDatabase(async (db) => {
    const { rows } = await db.execute<FollowingUser>(sql`
      SELECT
        f.followee_id AS "followeeId",
        u.id AS "userId",
        u.name AS "userName",
        u.username AS "userUsername",
        u.image AS "userImage",
        EXISTS (
          SELECT 1
          FROM ${follows} AS viewer_follow
          WHERE viewer_follow.follower_id = ${viewerUserId}
            AND viewer_follow.followee_id = f.followee_id
        ) AS "isFollowing"
      FROM ${follows} AS f
      JOIN ${users} AS u ON f.followee_id = u.id
      WHERE f.follower_id = ${userId}
      ORDER BY LOWER(u.name), u.id;
    `);

    return rows;
  });
}
