import { sql } from 'drizzle-orm';
import type { SortBy, SortOrder } from '@/app/profile/[...slug]/page';
import { withDatabase } from '@/infra/neon/db-utils';
import { movies, ratings, type User, users } from '@/infra/neon/schema';

export type UserRatings = {
  movieId: string;
  score: number;
  createdAt: Date;
  title: string;
  year: string;
  posterPath: string;
  tmdbId: number;
};

export class UserPgRepository {
  async getUserById(userId: string): Promise<User> {
    return await withDatabase(async (db) => {
      const query = sql<User>`
        SELECT * FROM users WHERE ${users.id} = ${userId};
      `;

      const { rows } = await db.execute<User>(query);
      return rows[0];
    });
  }

  async getUserRatingMovies(
    id: string,
    {
      field = 'createdAt',
      dir = 'desc',
    }: {
      field?: SortBy;
      dir?: SortOrder;
    } = {}
  ): Promise<UserRatings[]> {
    return await withDatabase(async (db) => {
      const orderExpr =
        field === 'score'
          ? sql`r.score ${sql.raw(dir)} , r.created_at DESC`
          : sql`r.created_at ${sql.raw(dir)}`;

      const query = sql`
        SELECT
          r.movie_id     AS "movieId",
          r.score        AS "score",
          r.created_at   AS "createdAt",
          m.title        AS "title",
          m.year         AS "year",
          m.poster_path  AS "posterPath",
          m.tmdb_id      AS "tmdbId"
        FROM ${ratings} r
        JOIN ${movies}  m ON m.id = r.movie_id
        WHERE r.user_id = ${id}
        ORDER BY ${orderExpr};
      `;

      const { rows } = await db.execute<UserRatings>(query);
      return rows;
    });
  }

  async rateMovie(id: string, movieId: bigint, score: number): Promise<void> {
    return await withDatabase(async (db) => {
      const query = sql`
        INSERT INTO ${ratings}
          (user_id, movie_id, score, created_at)
        VALUES
          (${id}, ${movieId}, ${score}, now())
        ON CONFLICT (user_id, movie_id)
        DO UPDATE SET
          score = EXCLUDED.score,
          created_at = now();
      `;

      await db.execute(query);
    });
  }
}
