import { sql } from 'drizzle-orm';
import type { PersistMediaInput } from '@/modules/media-catalog/media.type';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import {
  media,
  mediaExternalIds,
  ratings,
  watchlist,
} from '@/platform/database/postgres/schema';

export type PersistedRating = {
  id: string;
  user_id: string;
  media_id: string;
  score: number;
  watched_date: string;
  created_at: Date;
};

export type PersistRatingMutationResult = {
  rating: PersistedRating;
  removedFromWatchlist: boolean;
};

/** Atomically persists media and rating, then removes any matching watchlist item. */
export async function persistRatingMutation(
  userId: string,
  mediaData: PersistMediaInput,
  score: number,
  watchedDate: string
): Promise<PersistRatingMutationResult> {
  return await withDatabase((db) =>
    db.transaction(async (tx) => {
      const namespace =
        mediaData.kind === 'movie' ? 'tmdb:movie' : 'tmdb:tv';
      const externalId = String(mediaData.tmdbId);
      await tx.execute(
        sql`SELECT pg_advisory_xact_lock(hashtextextended(${`${namespace}:${externalId}`}, 0))`
      );

      const existing = await tx.execute<{ id: string }>(sql`
        SELECT media_id AS id
        FROM ${mediaExternalIds}
        WHERE namespace = ${namespace} AND external_id = ${externalId}
      `);
      let mediaId = existing.rows[0]?.id;

      if (mediaId) {
        await tx.execute(sql`
          UPDATE ${media}
          SET
            kind = ${mediaData.kind}, title = ${mediaData.title},
            original_title = ${mediaData.originalTitle},
            release_date = ${mediaData.releaseDate},
            runtime_minutes = ${mediaData.runtimeMinutes},
            overview = ${mediaData.overview}, poster_path = ${mediaData.posterPath},
            backdrop_path = ${mediaData.backdropPath},
            source_synced_at = ${mediaData.sourceSyncedAt}, updated_at = now()
          WHERE id = ${mediaId}
        `);
      } else {
        const inserted = await tx.execute<{ id: string }>(sql`
          INSERT INTO ${media}
            (kind, title, original_title, release_date, runtime_minutes, overview,
             poster_path, backdrop_path, source_synced_at)
          VALUES
            (${mediaData.kind}, ${mediaData.title}, ${mediaData.originalTitle},
             ${mediaData.releaseDate}, ${mediaData.runtimeMinutes}, ${mediaData.overview},
             ${mediaData.posterPath}, ${mediaData.backdropPath}, ${mediaData.sourceSyncedAt})
          RETURNING id
        `);
        mediaId = inserted.rows[0]?.id;
        if (!mediaId) {
          throw new Error('Unable to persist media');
        }
        await tx.execute(sql`
          INSERT INTO ${mediaExternalIds} (media_id, namespace, external_id)
          VALUES (${mediaId}, ${namespace}, ${externalId})
        `);
      }

      const { rows: ratingRows } = await tx.execute<PersistedRating>(sql`
        INSERT INTO ${ratings}
          (user_id, media_id, score, watched_date, created_at)
        VALUES (${userId}, ${mediaId}, ${score}, ${watchedDate}, now())
        ON CONFLICT (user_id, media_id)
        DO UPDATE SET
          score = EXCLUDED.score,
          watched_date = EXCLUDED.watched_date,
          created_at = now()
        RETURNING id, user_id, media_id, score, watched_date, created_at
      `);
      const rating = ratingRows[0];
      if (!rating) {
        throw new Error('Unable to persist rating');
      }

      const removed = await tx.execute(sql`
        DELETE FROM ${watchlist}
        WHERE user_id = ${userId} AND media_id = ${mediaId}
        RETURNING media_id
      `);

      return {
        rating,
        removedFromWatchlist: (removed.rowCount ?? removed.rows.length) > 0,
      };
    })
  );
}
