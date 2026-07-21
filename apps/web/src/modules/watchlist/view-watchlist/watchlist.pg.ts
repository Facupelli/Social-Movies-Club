import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import { media, watchlist } from '@/platform/database/postgres/schema';
import type { WatchlistRow } from '@/modules/watchlist/watchlist.types';

export async function getProfileWatchlist(
  userId: string
): Promise<WatchlistRow[]> {
  return await withDatabase(async (db) => {
    const query = sql`
      SELECT
        m.id AS "movieId",
        m.tmdb_id AS "movieTmdbId",
        m.title AS "movieTitle",
        m.overview AS "movieOverview",
        m.poster_path AS "moviePosterPath",
        m.backdrop_path AS "movieBackdropPath",
        m.year AS "movieYear",
        m.type AS "movieType",
        m.runtime AS "movieRuntime"
      FROM ${watchlist} w
      JOIN ${media} m ON m.id = w.media_id
      WHERE user_id = ${userId}
      ORDER BY w.created_at DESC;
    `;

    const { rows } = await db.execute<WatchlistRow>(query);
    return rows;
  });
}
