import { sql } from "drizzle-orm";
import type { SortBy, SortOrder } from "@/app/profile/[id]/page";
import { withDatabase } from "@/infra/postgres/db-utils";
import { movies, ratings, type User, users } from "@/infra/postgres/schema";
import type {
  FeedItem,
  FeedItemRaw,
  GetUserFeedParams,
  UserRatings,
} from "./user.types";

export interface GetUserFollowsInfoMap {
  followerCount: number;
  followingCount: number;
}

export class UserPgRepository {
  async getUserById(userId: string): Promise<User> {
    return await withDatabase(async (db) => {
      const query = sql<User>`
        SELECT * FROM users WHERE ${users.id} = ${userId}
      `;

      const { rows } = await db.execute<User>(query);
      return rows[0];
    });
  }

  async getUserFollowsInfo(userId: string): Promise<GetUserFollowsInfoMap> {
    return await withDatabase(async (db) => {
      const { rows } = await db.execute<{
        follower_count: number;
        following_count: number;
      }>(sql`
        SELECT
          (SELECT COUNT(*) FROM follows WHERE followee_id = ${userId}) as follower_count,
          (SELECT COUNT(*) FROM follows WHERE follower_id = ${userId}) as following_count
      `);

      const row = rows[0];
      return {
        followerCount: row.follower_count,
        followingCount: row.following_count,
      };
    });
  }

  async getUserFeed({
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
          m.id as movie_id,
          m.tmdb_id as movie_tmdb_id,
          m.title as movie_title,
          m.year as movie_year,
          m.poster_path as movie_poster,
          m.overview as movie_overview,
          r.score,
          r.created_at as rated_at
        FROM feed_items as fi
        INNER JOIN users actor ON fi.actor_id = actor.id
        INNER JOIN ratings r ON fi.rating_id = r.id
        INNER JOIN movies m ON r.movie_id = m.id
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
        movieId: row.movie_id,
        movieOverview: row.movie_overview,
        movieTmdbId: row.movie_tmdb_id,
        movieTitle: row.movie_title,
        movieYear: row.movie_year,
        moviePoster: row.movie_poster,
        score: row.score,
        ratedAt: row.rated_at,
        seenAt: row.seen_at,
      }));

      const nextCursor =
        newFeedItems.length === limit
          ? new Date(
              newFeedItems[newFeedItems.length - 1].ratedAt
            ).toISOString()
          : null;

      return {
        items: newFeedItems,
        nextCursor,
      };
    });
  }

  async getUserRatingMovies(
    id: string,
    {
      field = "createdAt",
      dir = "desc",
    }: {
      field?: SortBy;
      dir?: SortOrder;
    } = {}
  ): Promise<UserRatings[]> {
    return await withDatabase(async (db) => {
      const orderExpr =
        field === "score"
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
          m.overview     AS "overview",
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

  async rateMovie(
    userId: string,
    movieId: bigint,
    score: number
  ): Promise<void> {
    return await withDatabase(async (db) => {
      const createRatingQuery = sql`
          INSERT INTO ${ratings}
            (user_id, movie_id, score, created_at)
          VALUES
            (${userId}, ${movieId}, ${score}, now())
          ON CONFLICT (user_id, movie_id)
          DO UPDATE SET
            score = EXCLUDED.score,
            created_at = now()
          RETURNING id, user_id, movie_id, score, created_at
        `;

      const ratingResult = await db.execute<{
        id: string;
        user_id: string;
        movie_id: string;
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
}
