import { type SQL, sql } from 'drizzle-orm';
import {
  type SubscriptionAvailabilityFilter,
  subscriptionAvailabilityStatusSql,
} from '@/modules/media-availability/match-subscription-availability.pg';
import type { WatchlistRow } from '@/modules/watchlist/watchlist.types';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import {
  media,
  mediaAvailabilitySync,
  watchlist,
} from '@/platform/database/postgres/schema';
import { tmdbNamespaceForKindSql } from '@/platform/tmdb/tmdb-media-kind';

export async function getProfileWatchlist(
  userId: string
): Promise<WatchlistRow[]> {
  return await withDatabase(async (db) => {
    const { rows } = await db.execute<WatchlistRow>(sql`
      ${watchlistTitlesSql(userId)}
      ORDER BY "addedAt" DESC, "movieId" DESC
    `);
    return rows;
  });
}

function watchlistTitlesSql(userId: string, availability?: SQL): SQL {
  return sql`
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
        ${availability ? sql`, ${availability} AS availability` : sql``}
      FROM ${watchlist} w
      JOIN ${media} m ON m.id = w.media_id
      JOIN media_external_ids mei
        ON mei.media_id = m.id
        AND mei.namespace = ${tmdbNamespaceForKindSql(sql.raw('m.kind'))}
      ${availability ? sql`LEFT JOIN ${mediaAvailabilitySync} sync ON sync.media_id = m.id` : sql``}
      WHERE w.user_id = ${userId}
  `;
}

export async function getProfileWatchlistOnSubscriptions(
  ownerId: string,
  filter: SubscriptionAvailabilityFilter
): Promise<{ rows: WatchlistRow[]; totalCount: number; unknownCount: number }> {
  const availability = subscriptionAvailabilityStatusSql({
    mediaId: sql`m.id`,
    fetchedAt: sql`sync.fetched_at`,
    filter,
  });

  return await withDatabase(async (db) => {
    const result = await db.execute<
      (WatchlistRow | { movieId: null }) & {
        totalCount: number;
        unknownCount: number;
      }
    >(sql`
      WITH titles AS (${watchlistTitlesSql(ownerId, availability)}),
      counts AS (
        SELECT COUNT(*)::int AS "totalCount",
          (COUNT(*) FILTER (WHERE availability = 'unknown'))::int AS "unknownCount"
        FROM titles
      )
      SELECT titles.*, counts.*
      FROM counts
      LEFT JOIN titles ON titles.availability = 'match'
      ORDER BY titles."addedAt" DESC, titles."movieId" DESC
    `);

    return {
      rows: result.rows.filter((row) => row.movieId !== null),
      totalCount: result.rows[0]?.totalCount ?? 0,
      unknownCount: result.rows[0]?.unknownCount ?? 0,
    };
  });
}
