import { waitUntil } from "@vercel/functions";
import { sql } from "drizzle-orm";
import { withDatabase } from "@/infra/postgres/db-utils";
import {
	feedItemRatings,
	feedItems,
	feedMediaBucket,
	follows,
	media,
	ratings,
	type User,
	users,
} from "@/infra/postgres/schema";
import type { AggregatedFeedItem } from "./feed.types";
import type {
	FeedItem,
	FeedItemRaw,
	GetUserFeedParams,
	GetUserRatingMovies,
	UserMoviesServerFilters,
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

	// this query repeats every time this
	// - scan all ratings of every follower
	// - group/aggregate them per media
	// - joinn users and media
	async getAggregatedFeedOnTheFly(
		userId: string,
		cursor: string | null = null,
		limit: number = 20,
	) {
		return await withDatabase(async (db) => {
			const query = sql`
				WITH latest AS (
					SELECT
						r.media_id,
						jsonb_agg(
							jsonb_build_object(
								'userId', r.user_id,
								'score', r.score,
								'createdAt', r.created_at,
								'user', jsonb_build_object(
									'name',  u.name,
									'image', u.image
								)
							) ORDER BY r.created_at DESC
						) AS ratings,
						MAX(r.created_at) AS updated_at
					FROM ${ratings} r
					JOIN ${users} u ON u.id = r.user_id
					WHERE r.user_id IN (
						SELECT followee_id
						FROM ${follows}
						WHERE follower_id = ${userId}
					)
					${cursor ? sql`AND r.created_at < ${cursor}::timestamptz` : sql``}
					GROUP BY r.media_id
				)
			SELECT
				m.id as "mediaId",
				m.title,
				m.poster_path as "posterPath",
				m.backdrop_path as "backdropPath",
				l.ratings,
				l.updated_at as "udpatedAt"
			FROM latest l
			JOIN ${media} m ON m.id = l.media_id
			ORDER BY l.updated_at DESC, m.id DESC
			LIMIT ${limit}
			`;

			const { rows } = await db.execute(query);
			return rows;
		});
	}

	async getAggregatedFeed({
		userId,
		limit = 20,
		cursor = null,
	}: GetUserFeedParams): Promise<{
		items: AggregatedFeedItem[];
		nextCursor: string | null;
	}> {
		return withDatabase(async (db) => {
			const query = sql`
				SELECT
					fmb.id as "bucketId",
					fmb.media_id as "mediaId",
					fmb.rating_count as "ratingCount",
					fmb.last_rating_at as "lastRatingAt",
					fmb.seen_at as "seenAt",
					jsonb_build_object(
						'id',           m.id,
						'tmdbId',       m.tmdb_id,
						'type',         m.type,
						'title',        m.title,
						'year',         m.year,
						'posterPath',   m.poster_path,
						'backdropPath', m.backdrop_path,
						'overview',     m.overview
					) AS media,
					(
						SELECT json_agg(
							json_build_object(
								'ratingId', r.id,
								'score', r.score,
								'createdAt', r.created_at,
								'user', jsonb_build_object(
									'id',         u.id,
									'name',       u.name,
									'image',      u.image,
									'username',   u.username
								)
							) 
							ORDER BY r.created_at DESC
						) 
						FROM ${feedItemRatings} fir
						JOIN ${ratings} r ON fir.rating_id = r.id
						JOIN ${users} u ON u.id = r.user_id
						WHERE fir.aggregated_feed_item_id = fmb.id
					) as ratings
				FROM ${feedMediaBucket} fmb
				JOIN ${media} m ON m.id = fmb.media_id
				WHERE fmb.user_id = ${userId}
				${cursor ? sql`AND fmb.last_rating_at < ${cursor}` : sql``}
				ORDER BY fmb.last_rating_at DESC
				LIMIT ${limit}
			`;

			const { rows: feedItems } = await db.execute<AggregatedFeedItem>(query);

			const lastElement = feedItems.at(-1);

			const nextCursor =
				lastElement && feedItems.length === limit
					? new Date(lastElement.lastRatingAt).toISOString()
					: null;

			return {
				items: feedItems,
				nextCursor,
			};
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
					m.backdrop_path as movie_backdrop,
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
				movieBackdrop: row.movie_backdrop,
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
		userId: string,
		{
			sortBy = "createdAt",
			sortOrder = "desc",
			typeFilter = "all",
			limit,
			offset,
			bothRated = false,
		}: UserMoviesServerFilters = {},
		sessionUserId?: string,
	): Promise<GetUserRatingMovies> {
		return await withDatabase(async (db) => {
			const orderExpr =
				sortBy === "score"
					? sql`r.score ${sql.raw(sortOrder)} , r.created_at DESC`
					: sql`r.created_at ${sql.raw(sortOrder)}`;

			const typeFilterExpr =
				typeFilter === "all" ? sql`` : sql`AND m.type = ${typeFilter}`;

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
          r.created_at     AS "createdAt",
          m.title,
          m.year,
          m.poster_path    AS "posterPath",
          m.backdrop_path  AS "backdropPath",
          m.overview,
          m.tmdb_id        AS "tmdbId",
          m.type           
        FROM ${ratings} r
        JOIN ${media}  m ON m.id = r.media_id
        WHERE r.user_id = ${userId} ${typeFilterExpr} ${bothRatedExpr}
        ORDER BY ${orderExpr}
      `;

			const countQuery = sql`
        SELECT COUNT(*) as count
        FROM ${ratings} r
        WHERE r.user_id = ${userId};
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

			waitUntil(
				db.transaction(async (tx) => {
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
					const followersToProcess = followers.slice(
						0,
						MAX_FOLLOWERS_TO_FANOUT,
					);

					if (followersSkipped > 0) {
						console.warn(
							`⚠️  Skipping ${followersSkipped} followers for rating ${rating.id} (over limit)`,
						);
					}

					let feedItemsCreated = 0;
					if (followersToProcess.length > 0) {
						await tx.execute(sql`
							INSERT INTO ${feedItems} (user_id, actor_id, rating_id)
							VALUES ${sql.join(
								followersToProcess.map(
									(follower) =>
										sql`(${follower.follower_id}, ${userId}, ${rating.id})`,
								),
								sql`, `,
							)}
      			`);

						// AGGREGATED TABLE
						const { rows: bucketResults } = await tx.execute<{
							id: string;
						}>(sql`
							INSERT INTO ${feedMediaBucket} (user_id, media_id, rating_count)
							VALUES ${sql.join(
								followersToProcess.map(
									(follower) =>
										sql`(${follower.follower_id}, ${rating.media_id}, 1)`,
								),
								sql`, `,
							)}
						  ON CONFLICT (user_id, media_id)
							DO UPDATE SET
								rating_count = ${feedMediaBucket.ratingCount} + 1,
								last_rating_at = now()
							RETURNING id
						`);

						const bucketResult = bucketResults[0];

						await tx.execute(sql`
								INSERT INTO ${feedItemRatings} (aggregated_feed_item_id, rating_id, added_at)
								VALUES (${bucketResult.id}, ${rating.id}, now())
								ON CONFLICT DO NOTHING
						`);
						// -------------------------

						feedItemsCreated = followersToProcess.length;
					}

					console.log(
						`📢 Created ${feedItemsCreated} feed items for rating ${rating.id}`,
					);
				}),
			);
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
