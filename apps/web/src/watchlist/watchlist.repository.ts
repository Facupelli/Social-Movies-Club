import { sql } from 'drizzle-orm';
import { withDatabase } from '@/infra/postgres/db-utils';
import { movies, watchlist } from '@/infra/postgres/schema';

export type UserWatchlist = {
  watchlistId: string;
  movieId: string;
  movieTmdbId: number;
  movieTitle: string;
  movieOverview: string;
  moviePosterPath: string;
  movieYear: string;
};

export class WatchlistPgRepository {
  async addMovie(userId: string, movieId: bigint): Promise<void> {
    return withDatabase(async (db) => {
      const query = sql`
        INSERT INTO ${watchlist} (user_id, movie_id)
        VALUES (${userId}, ${movieId})
      `;
      await db.execute(query);
    });
  }

  async removeMovie(userId: string, movieId: string): Promise<void> {
    return withDatabase(async (db) => {
      const query = sql`
        DELETE FROM ${watchlist}
        WHERE user_id = ${userId} AND movie_id = ${movieId}
      `;

      await db.execute(query);
    });
  }

  async getWatchlist(userId: string): Promise<UserWatchlist[]> {
    return withDatabase(async (db) => {
      const query = sql`
        SELECT
          w.id AS "watchlistId",
          m.id AS "movieId",
          m.tmdb_id AS "movieTmdbId",
          m.title AS "movieTitle",
          m.overview AS "movieOverview",
          m.poster_path AS "moviePosterPath",
          m.year AS "movieYear"
        FROM ${watchlist} w  
        JOIN ${movies} m ON m.id = w.movie_id 
        WHERE user_id = ${userId}
        ORDER BY w.created_at DESC;
      `;

      const { rows } = await db.execute<UserWatchlist>(query);
      return rows;
    });
  }
}
