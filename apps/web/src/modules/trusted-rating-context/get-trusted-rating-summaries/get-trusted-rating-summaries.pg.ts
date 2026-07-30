import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import {
  follows,
  ratings,
  userProfiles,
  users,
} from '@/platform/database/postgres/schema';
import { TRUSTED_RATER_PREVIEW_LIMIT } from '../trusted-rating-context.constants';
import type { TrustedRatingRow } from '../trusted-rating-context.types';

export async function findTrustedRatingSummaries(
  viewerUserId: string,
  mediaIds: readonly string[]
): Promise<TrustedRatingRow[]> {
  if (mediaIds.length === 0) {
    return [];
  }

  return await withDatabase(async (db) => {
    const { rows } = await db.execute<TrustedRatingRow>(sql`
      WITH trusted_ratings AS (
        SELECT
          r.id,
          r.media_id,
          r.user_id,
          r.score,
          r.watched_date,
          r.created_at,
          COALESCE(up.display_name, u.name) AS display_name,
          up.username,
          up.avatar_url,
          ROW_NUMBER() OVER (
            PARTITION BY r.media_id
            ORDER BY r.created_at DESC, r.id DESC
          ) AS recency_rank,
          COUNT(*) OVER (PARTITION BY r.media_id)::integer AS rating_count,
          AVG(r.score) OVER (PARTITION BY r.media_id) AS average_score
        FROM ${follows} f
        JOIN ${ratings} r ON r.user_id = f.followee_id
        JOIN ${users} u ON u.id = r.user_id
        LEFT JOIN ${userProfiles} up ON up.user_id = r.user_id
        WHERE f.follower_id = ${viewerUserId}
          AND r.user_id <> ${viewerUserId}
          AND r.media_id IN (${sql.join(
            mediaIds.map((mediaId) => sql`${mediaId}::uuid`),
            sql`, `
          )})
      )
      SELECT
        media_id AS "mediaId",
        MAX(rating_count)::integer AS "ratingCount",
        MAX(average_score) AS "averageScore",
        JSONB_AGG(
          JSONB_BUILD_OBJECT(
            'userId', user_id,
            'displayName', display_name,
            'username', username,
            'avatarUrl', avatar_url,
            'score', score,
            'watchedDate', watched_date,
            'ratedAt', created_at
          ) ORDER BY created_at DESC, id DESC
        ) FILTER (WHERE recency_rank <= ${TRUSTED_RATER_PREVIEW_LIMIT}) AS "previewRaters"
      FROM trusted_ratings
      GROUP BY media_id
    `);

    return rows;
  });
}
