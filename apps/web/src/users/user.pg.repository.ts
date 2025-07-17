import { sql } from "drizzle-orm";
import { withDatabase } from "@/infra/postgres/db-utils";
import { media, ratings, type User, users } from "@/infra/postgres/schema";
import type {
	FeedItem,
	FeedItemRaw,
	GetUserFeedParams,
	GetUserRatingMovies,
	GetUserRatingMoviesFilters,
	UserRatings,
} from "./user.types";

const MAX_FOLLOWERS_TO_FANOUT = 1000;

export class UserPgRepository {
	async getUsers(query: string): Promise<User[]> {
		return await withDatabase(async (db) => {
			const usernameQuery = `%${query}%`;

			const { rows } = await db.execute<User>(sql<User>`
        SELECT id, name, image, username FROM users WHERE ${users.username} ILIKE ${usernameQuery}
      `);

			return rows;
		});
	}

	async getById(userId: string): Promise<User> {
		return await withDatabase(async (db) => {
			const query = sql<User>`
        SELECT * FROM users WHERE ${users.id} = ${userId}
      `;

			const { rows } = await db.execute<User>(query);
			return rows[0];
		});
	}

	async getFeed({
		userId,
		limit = 20,
		cursor = null,
	}: GetUserFeedParams): Promise<{
		items: FeedItem[];
		nextCursor: string | null;
	}> {
		return await withDatabase(async (db) => {
			const feedResult = await db.execute<FeedItemRaw>(sql`
        SELECT 
          fi.id as feed_item_id,
          fi.actor_id,
          fi.created_at as feed_created_at,
          fi.seen_at,
          actor.name as actor_name,
          actor.username as actor_username,
          actor.image as actor_image,
          m.id as media_id,
          m.tmdb_id as movie_tmdb_id,
          m.title as movie_title,
          m.year as movie_year,
          m.poster_path as movie_poster,
          m.type as movie_type,
          m.overview as movie_overview,
          r.score,
          r.created_at as rated_at
        FROM feed_items as fi
        INNER JOIN users actor ON fi.actor_id = actor.id
        INNER JOIN ratings r ON fi.rating_id = r.id
        INNER JOIN media m ON r.media_id = m.id
        WHERE fi.user_id = ${userId}
        ${cursor ? sql`AND fi.created_at < ${cursor}` : sql``}
        ORDER BY fi.created_at DESC
        LIMIT ${limit}
      `);

			const newFeedItems: FeedItem[] = feedResult.rows.map((row) => ({
				feedItemId: row.feed_item_id,
				actorId: row.actor_id,
				actorName: row.actor_name,
				actorImage: row.actor_image,
				actorUsername: row.actor_username,
				movieId: row.media_id,
				movieOverview: row.movie_overview,
				movieTmdbId: row.movie_tmdb_id,
				movieTitle: row.movie_title,
				movieYear: row.movie_year,
				moviePoster: row.movie_poster,
				movieType: row.movie_type,
				score: row.score,
				ratedAt: row.rated_at,
				seenAt: row.seen_at,
			}));

			const lastElement = newFeedItems.at(-1);

			const nextCursor =
				lastElement && newFeedItems.length === limit
					? new Date(lastElement.ratedAt).toISOString()
					: null;

			return {
				items: newFeedItems,
				nextCursor,
			};
		});
	}

	async getRatingMovies(
		id: string,
		{
			field = "createdAt",
			dir = "desc",
			typeFilter = "all",
			limit,
			offset,
		}: GetUserRatingMoviesFilters = {},
	): Promise<GetUserRatingMovies> {
		return await withDatabase(async (db) => {
			const orderExpr =
				field === "score"
					? sql`r.score ${sql.raw(dir)} , r.created_at DESC`
					: sql`r.created_at ${sql.raw(dir)}`;

			const typeFilterExpr =
				typeFilter === "all" ? sql`` : sql`AND m.type = ${typeFilter}`;

			const countQuery = sql`
        SELECT COUNT(*) as count
        FROM ${ratings} r
        WHERE r.user_id = ${id};
      `;

			console.log({ typeFilter });

			let dataQuery = sql`
        SELECT
          r.media_id     AS "movieId",
          r.score        AS "score",
          r.created_at   AS "createdAt",
          m.title        AS "title",
          m.year         AS "year",
          m.poster_path  AS "posterPath",
          m.overview     AS "overview",
          m.tmdb_id      AS "tmdbId",
          m.type         AS "type"
        FROM ${ratings} r
        JOIN ${media}  m ON m.id = r.media_id
        WHERE r.user_id = ${id} ${typeFilterExpr}
        ORDER BY ${orderExpr}
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
				const currentOffset = offset;
				const nextOffset = currentOffset + limit;
				if (nextOffset < totalCount) {
					nextCursor = Math.floor(nextOffset / limit);
				}
			}

			return { data: dataResult.rows, nextCursor };
		});
	}

	async rateMovieWithQueue(
		userId: string,
		movieId: bigint,
		score: number,
	): Promise<void> {
		return await withDatabase(async (db) => {
			const createRatingQuery = sql`
          INSERT INTO ${ratings}
            (user_id, media_id, score, created_at)
          VALUES
            (${userId}, ${movieId}, ${score}, now())
          ON CONFLICT (user_id, media_id)
          DO UPDATE SET
            score = EXCLUDED.score,
            created_at = now()
          RETURNING id, user_id, media_id, score, created_at
        `;

			const ratingResult = await db.execute<{
				id: string;
				user_id: string;
				media_id: string;
				score: number;
				created_at: Date;
			}>(createRatingQuery);

			const rating = ratingResult.rows[0];
			// biome-ignore lint: debugin logs
			console.log(`✅ Rating created/updated: ${rating.id}`);

			const queueServiceUrl = process.env.QUEUE_SERVICE_URL;
			const response = await fetch(`${queueServiceUrl}/feed-item/process`, {
				headers: {
					"Content-Type": "application/json",
				},
				method: "POST",
				body: JSON.stringify({
					userId,
					ratingId: rating.id,
				}),
			});

			// biome-ignore lint: debugin logs
			console.log(`Rating-Job posted to queue service: ${response.ok}`);
		});
	}

	// Use this method untile QUEUE-SYSTEM app is deployed
	async rateMovie(
		userId: string,
		movieId: bigint,
		score: number,
	): Promise<void> {
		return await withDatabase(async (db) => {
			const createRatingQuery = sql`
          INSERT INTO ${ratings}
            (user_id, media_id, score, created_at)
          VALUES
            (${userId}, ${movieId}, ${score}, now())
          ON CONFLICT (user_id, media_id)
          DO UPDATE SET
            score = EXCLUDED.score,
            created_at = now()
          RETURNING id, user_id, media_id, score, created_at
        `;

			const ratingResult = await db.execute<{
				id: string;
				user_id: string;
				media_id: string;
				score: number;
				created_at: Date;
			}>(createRatingQuery);

			const rating = ratingResult.rows[0];
			// biome-ignore lint: debugin logs
			console.log(`✅ Rating created/updated: ${rating.id}`);

			await db.transaction(async (tx) => {
				// HANDLED BY QUEUE
				const { rows: followers } = await tx.execute<{
					follower_id: string;
				}>(sql`
            SELECT follower_id
            FROM follows
            WHERE followee_id = ${userId}
            LIMIT ${MAX_FOLLOWERS_TO_FANOUT + 1}
          `);

				const followersSkipped = Math.max(
					0,
					followers.length - MAX_FOLLOWERS_TO_FANOUT,
				);
				const followersToProcess = followers.slice(0, MAX_FOLLOWERS_TO_FANOUT);

				if (followersSkipped > 0) {
					console.warn(
						`⚠️  Skipping ${followersSkipped} followers for rating ${rating.id} (over limit)`,
					);
				}

				let feedItemsCreated = 0;
				if (followersToProcess.length > 0) {
					await tx.execute(sql`
          INSERT INTO feed_items (user_id, actor_id, rating_id)
          VALUES ${sql.join(
						followersToProcess.map(
							(follower) =>
								sql`(${follower.follower_id}, ${userId}, ${rating.id})`,
						),
						sql`, `,
					)}
      `);

					feedItemsCreated = followersToProcess.length;
				}

				console.log(
					`📢 Created ${feedItemsCreated} feed items for rating ${rating.id}`,
				);
			});
		});
	}

	async updatetUsername(userId: string, username: string): Promise<void> {
		return await withDatabase(async (db) => {
			const newUsername = `@${username}`;

			await db.execute(sql`
			  UPDATE ${users}
				SET username = ${newUsername}
			  WHERE id = ${userId}
			`);
		});
	}
}
