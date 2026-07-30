import { sql } from 'drizzle-orm';
import type { WatchlistRow } from '@/modules/watchlist/watchlist.types';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import { media, watchlist } from '@/platform/database/postgres/schema';
import { tmdbNamespaceForKindSql } from '@/platform/tmdb/tmdb-media-kind';

export async function getProfileWatchlist(
  userId: string
): Promise<WatchlistRow[]> {
  return await withDatabase(async (db) => {
    const query = sql`
      SELECT
        m.id AS "movieId",
        w.created_at AS "addedAt",
        mei.external_id::integer AS "movieTmdbId",
        m.title AS "movieTitle",
        COALESCE(m.overview, '') AS "movieOverview",
        COALESCE(m.poster_path, '') AS "moviePosterPath",
        COALESCE(m.backdrop_path, '') AS "movieBackdropPath",
        COALESCE(EXTRACT(YEAR FROM m.release_date)::text, '') AS "movieYear",
        m.kind,
        m.runtime_minutes AS "movieRuntime"
      FROM ${watchlist} w
      JOIN ${media} m ON m.id = w.media_id
      JOIN media_external_ids mei
        ON mei.media_id = m.id
        AND mei.namespace = ${tmdbNamespaceForKindSql(sql.raw('m.kind'))}
      WHERE w.user_id = ${userId}
      ORDER BY w.created_at DESC, m.id DESC;
    `;

    const { rows } = await db.execute<WatchlistRow>(query);
    return rows;
  });
}
