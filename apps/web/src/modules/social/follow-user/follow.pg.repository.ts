import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import { follows } from '@/platform/database/postgres/schema';

export class FollowPgRepository {
  async follow(userId: string, followedUserId: string): Promise<boolean> {
    return await withDatabase(async (db) => {
      const { rows } = await db.execute<{ followerId: string }>(sql`
        INSERT INTO ${follows} (follower_id, followee_id)
        VALUES (${userId}, ${followedUserId})
        ON CONFLICT DO NOTHING
        RETURNING follower_id AS "followerId";
      `);

      return rows.length > 0;
    });
  }

  async unfollow(userId: string, followedUserId: string): Promise<boolean> {
    return await withDatabase(async (db) => {
      const { rows } = await db.execute<{ followerId: string }>(sql`
        DELETE FROM ${follows}
        WHERE follower_id = ${userId}
          AND followee_id = ${followedUserId}
        RETURNING follower_id AS "followerId";
      `);

      return rows.length > 0;
    });
  }
}
