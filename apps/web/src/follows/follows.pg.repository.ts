import { sql } from "drizzle-orm";
import { db } from "@/infra/postgres/db.neon";
import { withDatabase } from "@/infra/postgres/db-utils";
import { follows, users } from "@/infra/postgres/schema";
import type { GetFollowingUsers, GetUserFollowsInfoMap } from "./follows.type";

export class FollowsPgRepository {
  async getFollowingUsers(userId: string): Promise<GetFollowingUsers[]> {
    const { rows } = await db.execute<GetFollowingUsers>(
      sql`
        SELECT
          f.followee_id AS "followeeId",
          u.id AS "userId",
          u.name AS "userName",
          u.username AS "userUsername",
          u.image AS "userImage"
        FROM ${follows} f
        JOIN ${users} u ON f.followee_id = u.id
        WHERE follower_id = ${userId};
      `
    );

    return rows;
  }

  async getUserFollowsInfo(userId: string): Promise<GetUserFollowsInfoMap> {
    return await withDatabase(async (db) => {
      const { rows } = await db.execute<{
        follower_count: number;
        following_count: number;
      }>(sql`
          SELECT
            (SELECT COUNT(*) FROM follows WHERE followee_id = ${userId}) as follower_count,
            (SELECT COUNT(*) FROM follows WHERE follower_id = ${userId}) as following_count
        `);

      const row = rows[0];
      return {
        followerCount: row.follower_count,
        followingCount: row.following_count,
      };
    });
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
