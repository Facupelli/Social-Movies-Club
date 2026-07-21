import { and, desc, eq, lt } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import {
  feedItems,
  media,
  ratings,
  users,
} from '@/platform/database/postgres/schema';
import type { FeedItem, GetUserFeedParams, UserFeedPage } from './feed.types';

const actor = alias(users, 'actor');

export async function getUserFeed({
  userId,
  limit = 20,
  cursor = null,
}: GetUserFeedParams): Promise<UserFeedPage> {
  return await withDatabase(async (db) => {
    const rows = await db
      .select({
        feedItemId: feedItems.id,
        actorId: feedItems.actorId,
        feedCreatedAt: feedItems.createdAt,
        seenAt: feedItems.seenAt,
        actorName: actor.name,
        actorUsername: actor.username,
        actorImage: actor.image,
        mediaId: media.id,
        movieTmdbId: media.tmdbId,
        movieTitle: media.title,
        movieYear: media.year,
        moviePoster: media.posterPath,
        movieBackdrop: media.backdropPath,
        movieType: media.type,
        movieOverview: media.overview,
        score: ratings.score,
        ratedAt: ratings.createdAt,
      })
      .from(feedItems)
      .innerJoin(actor, eq(feedItems.actorId, actor.id))
      .innerJoin(ratings, eq(feedItems.ratingId, ratings.id))
      .innerJoin(media, eq(ratings.mediaId, media.id))
      .where(
        and(
          eq(feedItems.userId, userId),
          cursor ? lt(feedItems.createdAt, new Date(cursor)) : undefined
        )
      )
      .orderBy(desc(feedItems.createdAt))
      .limit(limit);

    const items: FeedItem[] = rows.map((row) => ({
      feedItemId: row.feedItemId,
      actorId: row.actorId,
      actorName: row.actorName,
      actorImage: row.actorImage,
      actorUsername: row.actorUsername,
      movieId: row.mediaId,
      movieOverview: row.movieOverview ?? '',
      movieTmdbId: row.movieTmdbId,
      movieTitle: row.movieTitle,
      movieYear: row.movieYear,
      moviePoster: row.moviePoster,
      movieBackdrop: row.movieBackdrop,
      movieType: row.movieType,
      score: row.score,
      ratedAt: row.ratedAt.toISOString(),
      seenAt: row.seenAt?.toISOString() ?? null,
    }));

    const lastRow = rows.at(-1);
    const nextCursor =
      lastRow && items.length === limit
        ? lastRow.feedCreatedAt.toISOString()
        : null;

    return { items, nextCursor };
  });
}
