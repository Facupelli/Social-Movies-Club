import { sql } from "drizzle-orm";
import { withDatabase } from "@/infra/postgres/db-utils";
import { media, watchlist } from "@/infra/postgres/schema";
import type { MediaType } from "@/media/media.type";

export type UserWatchlist = {
	watchlistId: string;
	movieId: string;
	movieTmdbId: number;
	movieTitle: string;
	movieOverview: string;
	moviePosterPath: string;
	movieBackdropPath: string;
	movieYear: string;
	movieType: MediaType;
};

export class WatchlistPgRepository {
	async addMedia(userId: string, mediaId: bigint): Promise<void> {
		return await withDatabase(async (db) => {
			const query = sql`
        INSERT INTO ${watchlist} (user_id, media_id)
        VALUES (${userId}, ${mediaId})
      `;
			await db.execute(query);
		});
	}

	async removeMedia(userId: string, mediaId: string): Promise<void> {
		return await withDatabase(async (db) => {
			const query = sql`
        DELETE FROM ${watchlist}
        WHERE user_id = ${userId} AND media_id = ${mediaId}
      `;

			await db.execute(query);
		});
	}

	async getWatchlist(userId: string): Promise<UserWatchlist[]> {
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
          m.type AS "movieType"
        FROM ${watchlist} w  
        JOIN ${media} m ON m.id = w.media_id 
        WHERE user_id = ${userId}
        ORDER BY w.created_at DESC;
      `;

			const { rows } = await db.execute<UserWatchlist>(query);
			return rows;
		});
	}
}
