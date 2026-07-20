import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import { media, ratings } from '@/platform/database/postgres/schema';
import type {
  GetUserRatingMovies,
  UserMoviesServerFilters,
  UserRatings,
} from './profile-ratings.types';

export async function getUserRatingMovies(
  userId: string,
  {
    sortBy = 'createdAt',
    sortOrder = 'desc',
    typeFilter = 'all',
    limit,
    offset,
    bothRated = false,
  }: UserMoviesServerFilters = {},
  sessionUserId?: string
): Promise<GetUserRatingMovies> {
  return await withDatabase(async (db) => {
    const orderExpr =
      sortBy === 'score'
        ? sql`r.score ${sql.raw(sortOrder)} , r.created_at DESC`
        : sql`r.created_at ${sql.raw(sortOrder)}`;

    const typeFilterExpr =
      typeFilter === 'all' ? sql`` : sql`AND m.type = ${typeFilter}`;

    const bothRatedExpr =
      bothRated && sessionUserId && sessionUserId !== userId
        ? sql`AND NOT EXISTS(
            SELECT 1
            FROM ratings r1
            JOIN ratings r2 ON r1.media_id = r2.media_id
            WHERE r1.user_id = ${userId}
              AND r2.user_id = ${sessionUserId}
              AND r1.media_id = r.media_id
          )`
        : sql``;

    let dataQuery = sql`
      SELECT
        r.media_id       AS "movieId",
        r.score,
        r.watched_date   AS "watchedDate",
        r.created_at     AS "createdAt",
        m.title,
        m.year,
        m.poster_path    AS "posterPath",
        m.backdrop_path  AS "backdropPath",
        m.overview,
        m.tmdb_id        AS "tmdbId",
        m.type,
        m.runtime
      FROM ${ratings} r
      JOIN ${media} m ON m.id = r.media_id
      WHERE r.user_id = ${userId} ${typeFilterExpr} ${bothRatedExpr}
      ORDER BY ${orderExpr}
    `;

    const countQuery = sql`
      SELECT COUNT(*)::integer AS count
      FROM ${ratings} r
      JOIN ${media} m ON m.id = r.media_id
      WHERE r.user_id = ${userId} ${typeFilterExpr} ${bothRatedExpr}
    `;

    if (limit !== undefined && offset !== undefined) {
      dataQuery = sql`${dataQuery} LIMIT ${limit} OFFSET ${offset}`;
    }

    const [countResult, dataResult] = await Promise.all([
      db.execute<{ count: number }>(countQuery),
      db.execute<UserRatings>(dataQuery),
    ]);

    const totalCount = countResult.rows[0]?.count || 0;
    let nextCursor: number | null = null;

    if (limit !== undefined && offset !== undefined) {
      const nextOffset = offset + limit;
      if (nextOffset < totalCount) {
        nextCursor = Math.floor(nextOffset / limit);
      }
    }

    return { data: dataResult.rows, nextCursor };
  });
}
