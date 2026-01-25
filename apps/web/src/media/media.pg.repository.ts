import { sql } from "drizzle-orm";
import { withDatabase } from "@/infra/postgres/db-utils";
import { type Media, media } from "@/infra/postgres/schema";

export class MediaPgRepository {
	async upsertMedia(movie: Omit<Media, "id">): Promise<{ id: string }> {
		return await withDatabase(async (db) => {
			const query = sql`
      WITH ins AS (
        INSERT INTO ${media} (title, year, overview, poster_path, backdrop_path, tmdb_id, type, runtime)
        VALUES (${movie.title}, ${movie.year}, ${movie.overview}, ${movie.posterPath}, ${movie.backdropPath}, ${movie.tmdbId}, ${movie.type}, ${movie.runtime})
        ON CONFLICT (tmdb_id) DO NOTHING
        RETURNING id
      )
      SELECT id FROM ins
      UNION
      SELECT id
      FROM ${media}
      WHERE tmdb_id = ${movie.tmdbId}
      `;

			const { rows } = await db.execute<{ id: string }>(query);
			return rows[0];
		});
	}

	async getMediaByTMDBId(tmdbId: number): Promise<{ id: string }> {
		return await withDatabase(async (db) => {
			const { rows } = await db.execute<{ id: string }>(sql`
        SELECT id FROM ${media} WHERE tmdb_id = ${tmdbId};
      `);

			return rows[0];
		});
	}

	async getMediaById(movieId: bigint): Promise<Media[]> {
		return await withDatabase(async (db) => {
			const query = sql`
        SELECT * FROM ${media} WHERE ${media.id} = ${movieId};
      `;

			const { rows } = await db.execute<Media>(query);
			return rows;
		});
	}
}
