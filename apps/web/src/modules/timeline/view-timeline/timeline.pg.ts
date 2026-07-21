import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import type {
  FeedItem,
  FeedItemRaw,
  GetUserFeedParams,
  UserFeedPage,
} from './feed.types';

export async function getUserFeed({
  userId,
  limit = 20,
  cursor = null,
}: GetUserFeedParams): Promise<UserFeedPage> {
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

    const items: FeedItem[] = feedResult.rows.map((row) => ({
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
      ratedAt: row.rated_at.toISOString(),
      seenAt: row.seen_at?.toISOString() ?? null,
    }));

    const lastRow = feedResult.rows.at(-1);
    const nextCursor =
      lastRow && items.length === limit
        ? lastRow.feed_created_at.toISOString()
        : null;

    return { items, nextCursor };
  });
}
