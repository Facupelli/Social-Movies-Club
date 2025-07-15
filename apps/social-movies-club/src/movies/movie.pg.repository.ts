import { sql } from 'drizzle-orm';
import { withDatabase } from '@/infra/neon/db-utils';
import { type Movie, movies } from '@/infra/neon/schema';

export class MoviePgRepository {
  async upsertMovie(movie: Omit<Movie, 'id'>): Promise<{ id: bigint }> {
    return await withDatabase(async (db) => {
      const query = sql`
      WITH ins AS (
        INSERT INTO ${movies} (title, year, poster_path, tmdb_id)
        VALUES (${movie.title}, ${movie.year}, ${movie.posterPath}, ${movie.tmdbId})
        ON CONFLICT (tmdb_id) DO NOTHING
        RETURNING id
      )
      SELECT id FROM ins
      UNION
      SELECT id
      FROM ${movies}
      WHERE tmdb_id = ${movie.tmdbId}
      `;

      const { rows } = await db.execute<{ id: bigint }>(query);
      return rows[0];
    });
  }

  async getMovieById(movieId: bigint): Promise<Movie[]> {
    return await withDatabase(async (db) => {
      const query = sql`
        SELECT * FROM ${movies} WHERE ${movies.id} = ${movieId};
      `;

      const { rows } = await db.execute<Movie>(query);
      return rows;
    });
  }
}
