import { sql } from "drizzle-orm";
import { db } from "@/infra/postgres/db.neon";
import { type Follow, follows } from "@/infra/postgres/schema";

export class FollowsPgRepository {
  async getFollowingUsers(userId: string): Promise<Follow[]> {
    const { rows } = await db.execute<Follow>(
      sql`
        SELECT
          follower_id AS "followerId",
          followee_id AS "followeeId"
        FROM ${follows}
        WHERE follower_id = ${userId};
      `
    );

    return rows;
  }

  async isFollowingUser(
    userId: string,
    followedUserId: string
  ): Promise<boolean> {
    const { rows } = await db.execute<{ is_following: boolean }>(
      sql`
        SELECT EXISTS (
          SELECT 1
          FROM ${follows} AS f
          WHERE f.follower_id = ${userId}
            AND f.followee_id = ${followedUserId}
        ) AS "is_following"
      `
    );

    return rows[0]?.is_following ?? false;
  }

  async followUser(userId: string, followedUserId: string): Promise<void> {
    await db.execute(
      sql`
        INSERT INTO ${follows} ("follower_id", "followee_id")
        VALUES (${userId}, ${followedUserId})
        ON CONFLICT DO NOTHING;
      `
    );
  }

  async unfollowUser(userId: string, followedUserId: string): Promise<void> {
    await db.execute(
      sql`
        DELETE FROM ${follows}
        WHERE follower_id = ${userId}
          AND followee_id = ${followedUserId};
      `
    );
  }
}
