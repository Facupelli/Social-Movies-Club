import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import {
  follows,
  ratings,
  userProfiles,
  users,
} from '@/platform/database/postgres/schema';
import { TRUSTED_RATER_PREVIEW_LIMIT } from '../trusted-rating-context.constants';
import type { TimelineTrustedRatingContextRow } from '../trusted-rating-context.types';

export type TimelineTrustedRatingEntry = {
  mediaId: string;
  actorId: string;
};

export async function findTimelineTrustedRatingContexts(
  viewerUserId: string,
  entries: readonly TimelineTrustedRatingEntry[]
): Promise<TimelineTrustedRatingContextRow[]> {
  if (entries.length === 0) {
    return [];
  }

  return await withDatabase(async (db) => {
    const inputRows = sql.join(
      entries.map(
        ({ mediaId, actorId }) => sql`(${mediaId}::uuid, ${actorId}::text)`
      ),
      sql`, `
    );
    const { rows } = await db.execute<TimelineTrustedRatingContextRow>(sql`
      WITH input(media_id, actor_id) AS (VALUES ${inputRows}),
      trusted_ratings AS (
        SELECT
          i.media_id,
          i.actor_id,
          r.id,
          r.user_id,
          r.score,
          r.watched_date,
          r.created_at,
          COALESCE(up.display_name, u.name) AS display_name,
          up.username,
          up.avatar_url
        FROM input i
        JOIN ${follows} f ON f.follower_id = ${viewerUserId}
        JOIN ${ratings} r
          ON r.user_id = f.followee_id AND r.media_id = i.media_id
        JOIN ${users} u ON u.id = r.user_id
        LEFT JOIN ${userProfiles} up ON up.user_id = r.user_id
        WHERE r.user_id <> ${viewerUserId}
      ),
      ranked AS (
        SELECT *,
          ROW_NUMBER() OVER (
            PARTITION BY media_id, actor_id ORDER BY created_at DESC, id DESC
          ) AS preview_rank,
          ROW_NUMBER() OVER (
            PARTITION BY media_id, actor_id
            ORDER BY (user_id = actor_id), created_at DESC, id DESC
          ) AS other_preview_rank
        FROM trusted_ratings
      )
      SELECT
        i.media_id AS "mediaId",
        i.actor_id AS "actorId",
        COUNT(r.user_id)::integer AS "ratingCount",
        AVG(r.score) AS "averageScore",
        COALESCE(BOOL_OR(r.user_id = i.actor_id), false) AS "actorIsCurrentlyTrusted",
        COUNT(r.user_id) FILTER (WHERE r.user_id <> i.actor_id)::integer AS "otherRaterCount",
        COALESCE(
          JSONB_AGG(
            JSONB_BUILD_OBJECT(
              'userId', r.user_id,
              'displayName', r.display_name,
              'username', r.username,
              'avatarUrl', r.avatar_url,
              'score', r.score,
              'watchedDate', r.watched_date,
              'ratedAt', r.created_at
            ) ORDER BY r.created_at DESC, r.id DESC
          ) FILTER (WHERE r.preview_rank <= ${TRUSTED_RATER_PREVIEW_LIMIT}),
          '[]'::jsonb
        ) AS "previewRaters",
        COALESCE(
          JSONB_AGG(
            JSONB_BUILD_OBJECT(
              'userId', r.user_id,
              'displayName', r.display_name,
              'username', r.username,
              'avatarUrl', r.avatar_url,
              'score', r.score,
              'watchedDate', r.watched_date,
              'ratedAt', r.created_at
            ) ORDER BY r.created_at DESC, r.id DESC
          ) FILTER (
            WHERE r.user_id <> i.actor_id
              AND r.other_preview_rank <= ${TRUSTED_RATER_PREVIEW_LIMIT}
          ),
          '[]'::jsonb
        ) AS "otherPreviewRaters"
      FROM input i
      LEFT JOIN ranked r
        ON r.media_id = i.media_id AND r.actor_id = i.actor_id
      GROUP BY i.media_id, i.actor_id
    `);

    return rows;
  });
}
