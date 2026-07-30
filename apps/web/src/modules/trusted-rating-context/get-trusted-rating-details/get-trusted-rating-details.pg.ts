import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import {
  follows,
  ratings,
  userProfiles,
  users,
} from '@/platform/database/postgres/schema';
import type { TrustedRatingDetailRow } from '../trusted-rating-context.types';

export async function findTrustedRatingDetails(
  viewerUserId: string,
  mediaId: string
): Promise<TrustedRatingDetailRow[]> {
  return await withDatabase(async (db) => {
    const { rows } = await db.execute<TrustedRatingDetailRow>(sql`
      SELECT
        r.user_id AS "userId",
        COALESCE(up.display_name, u.name) AS "displayName",
        up.username,
        up.avatar_url AS "avatarUrl",
        r.score,
        r.watched_date AS "watchedDate",
        r.created_at AS "ratedAt",
        COUNT(*) OVER ()::integer AS "ratingCount",
        AVG(r.score) OVER () AS "averageScore"
      FROM ${follows} f
      JOIN ${ratings} r ON r.user_id = f.followee_id
      JOIN ${users} u ON u.id = r.user_id
      LEFT JOIN ${userProfiles} up ON up.user_id = r.user_id
      WHERE f.follower_id = ${viewerUserId}
        AND r.user_id <> ${viewerUserId}
        AND r.media_id = ${mediaId}::uuid
      ORDER BY r.created_at DESC, r.id DESC
    `);

    return rows;
  });
}
