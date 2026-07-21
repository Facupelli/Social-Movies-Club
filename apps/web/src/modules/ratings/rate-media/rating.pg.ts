import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import type { Media } from '@/platform/database/postgres/schema';
import { media, ratings, watchlist } from '@/platform/database/postgres/schema';

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
  mediaData: Omit<Media, 'id'>,
  score: number,
  watchedDate: string
): Promise<PersistRatingMutationResult> {
  return await withDatabase((db) =>
    db.transaction(async (tx) => {
      const { rows: mediaRows } = await tx.execute<{ id: string }>(sql`
        WITH ins AS (
          INSERT INTO ${media} (title, year, overview, poster_path, backdrop_path, tmdb_id, type, runtime)
          VALUES (${mediaData.title}, ${mediaData.year}, ${mediaData.overview}, ${mediaData.posterPath}, ${mediaData.backdropPath}, ${mediaData.tmdbId}, ${mediaData.type}, ${mediaData.runtime})
          ON CONFLICT (tmdb_id, type) DO NOTHING
          RETURNING id
        )
        SELECT id FROM ins
        UNION ALL
        SELECT id FROM ${media}
        WHERE tmdb_id = ${mediaData.tmdbId} AND type = ${mediaData.type}
        LIMIT 1
      `);
      const mediaId = mediaRows[0]?.id;
      if (!mediaId) {
        throw new Error('Unable to persist media');
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
