import { and, desc, eq, lt, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import {
  feedItems,
  media,
  mediaExternalIds,
  ratings,
  userProfiles,
} from '@/platform/database/postgres/schema';
import { tmdbNamespaceForKindSql } from '@/platform/tmdb/tmdb-media-kind';
import type { FeedItem, GetUserFeedParams, UserFeedPage } from './feed.types';

const actorProfile = alias(userProfiles, 'actor_profile');

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
        actorName: actorProfile.displayName,
        actorUsername: actorProfile.username,
        actorImage: actorProfile.avatarUrl,
        mediaId: media.id,
        movieTmdbId: sql<number>`${mediaExternalIds.externalId}::integer`,
        movieTitle: media.title,
        movieYear: sql<string>`COALESCE(EXTRACT(YEAR FROM ${media.releaseDate})::text, '')`,
        moviePoster: sql<string>`COALESCE(${media.posterPath}, '')`,
        movieBackdrop: sql<string>`COALESCE(${media.backdropPath}, '')`,
        kind: media.kind,
        movieOverview: sql<string>`COALESCE(${media.overview}, '')`,
        score: ratings.score,
        ratedAt: ratings.createdAt,
      })
      .from(feedItems)
      .innerJoin(actorProfile, eq(feedItems.actorId, actorProfile.userId))
      .innerJoin(ratings, eq(feedItems.ratingId, ratings.id))
      .innerJoin(media, eq(ratings.mediaId, media.id))
      .innerJoin(
        mediaExternalIds,
        and(
          eq(mediaExternalIds.mediaId, media.id),
          eq(mediaExternalIds.namespace, tmdbNamespaceForKindSql(media.kind))
        )
      )
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
      kind: row.kind,
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
