import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import { follows } from '@/platform/database/postgres/schema';
import type { FollowSummary } from './follow-summary.types';

export class FollowSummaryPgRepository {
  async get(userId: string): Promise<FollowSummary> {
    return await withDatabase(async (db) => {
      const { rows } = await db.execute<FollowSummary>(sql`
        SELECT
          (
            SELECT COUNT(*)::integer
            FROM ${follows}
            WHERE followee_id = ${userId}
          ) AS "followerCount",
          (
            SELECT COUNT(*)::integer
            FROM ${follows}
            WHERE follower_id = ${userId}
          ) AS "followingCount"
      `);

      return rows[0] ?? { followerCount: 0, followingCount: 0 };
    });
  }
}
