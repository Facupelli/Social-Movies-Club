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
        mei.external_id::integer AS "movieTmdbId",
        m.title AS "movieTitle",
        COALESCE(m.overview, '') AS "movieOverview",
        COALESCE(m.poster_path, '') AS "moviePosterPath",
        COALESCE(m.backdrop_path, '') AS "movieBackdropPath",
        COALESCE(EXTRACT(YEAR FROM m.release_date)::text, '') AS "movieYear",
        CASE m.kind WHEN 'movie' THEN 'movie' ELSE 'tv' END AS "movieType",
        m.runtime_minutes AS "movieRuntime"
      FROM ${watchlist} w
      JOIN ${media} m ON m.id = w.media_id
      JOIN media_external_ids mei
        ON mei.media_id = m.id
        AND mei.namespace = CASE m.kind
          WHEN 'movie' THEN 'tmdb:movie'
          ELSE 'tmdb:tv'
        END
      WHERE user_id = ${userId}
      ORDER BY w.created_at DESC;
    `;

    const { rows } = await db.execute<WatchlistRow>(query);
    return rows;
  });
}
