import { and, desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import {
  follows,
  media,
  mediaExternalIds,
  ratings,
  userProfiles,
} from '@/platform/database/postgres/schema';
import { tmdbNamespaceForKindSql } from '@/platform/tmdb/tmdb-media-kind';
import type {
  GetUserRecommendationsParams,
  RecommendationItem,
  TrustedRatingContext,
  UserRecommendationsPage,
} from './recommendations.types';
import { encodeRecommendationsCursor } from './recommendations-cursor';

const SUPPORTER_MIN_SCORE = 8;
const MIN_AVERAGE_SCORE = 7;

const friendRatings = alias(ratings, 'friend_ratings');
const viewerRatings = alias(ratings, 'viewer_ratings');
const friendProfile = alias(userProfiles, 'friend_profile');

export async function getUserRecommendations({
  userId,
  limit = 20,
  cursor = null,
}: GetUserRecommendationsParams): Promise<UserRecommendationsPage> {
  return await withDatabase(async (db) => {
    const candidates = db.$with('recommendation_candidates').as(
      db
        .select({
          mediaId: friendRatings.mediaId,
          ratingCount: sql<number>`COUNT(*)::integer`.as('rating_count'),
          supporterCount: sql<number>`
            COUNT(*) FILTER (
              WHERE ${friendRatings.score} >= ${SUPPORTER_MIN_SCORE}
            )::integer
          `.as('supporter_count'),
          averageScore: sql<string>`AVG(${friendRatings.score})::numeric`.as(
            'average_score'
          ),
          latestWatchedDate: sql<string>`MAX(${friendRatings.watchedDate})`.as(
            'latest_watched_date'
          ),
        })
        .from(follows)
        .innerJoin(friendRatings, eq(follows.followeeId, friendRatings.userId))
        .leftJoin(
          viewerRatings,
          and(
            eq(viewerRatings.userId, userId),
            eq(viewerRatings.mediaId, friendRatings.mediaId)
          )
        )
        .where(and(eq(follows.followerId, userId), isNull(viewerRatings.id)))
        .groupBy(friendRatings.mediaId)
        .having(sql`AVG(${friendRatings.score}) >= ${MIN_AVERAGE_SCORE}`)
    );

    const rows = await db
      .with(candidates)
      .select({
        mediaId: media.id,
        movieTmdbId: sql<number>`${mediaExternalIds.externalId}::integer`,
        movieTitle: media.title,
        movieYear: sql<string>`
          COALESCE(EXTRACT(YEAR FROM ${media.releaseDate})::text, '')
        `,
        moviePoster: sql<string>`COALESCE(${media.posterPath}, '')`,
        movieBackdrop: sql<string>`COALESCE(${media.backdropPath}, '')`,
        movieRuntimeMinutes: media.runtimeMinutes,
        movieOverview: sql<string>`COALESCE(${media.overview}, '')`,
        kind: media.kind,
        ratingCount: candidates.ratingCount,
        supporterCount: candidates.supporterCount,
        averageScore: candidates.averageScore,
        latestWatchedDate: candidates.latestWatchedDate,
      })
      .from(candidates)
      .innerJoin(media, eq(candidates.mediaId, media.id))
      .innerJoin(
        mediaExternalIds,
        and(
          eq(mediaExternalIds.mediaId, media.id),
          eq(mediaExternalIds.namespace, tmdbNamespaceForKindSql(media.kind))
        )
      )
      .where(
        cursor
          ? sql`
              (
                ${candidates.supporterCount} < ${cursor.supporterCount}

                OR (
                  ${candidates.supporterCount} = ${cursor.supporterCount}
                  AND ${candidates.averageScore} < ${cursor.averageScore}::numeric
                )

                OR (
                  ${candidates.supporterCount} = ${cursor.supporterCount}
                  AND ${candidates.averageScore} = ${cursor.averageScore}::numeric
                  AND ${candidates.ratingCount} < ${cursor.ratingCount}
                )

                OR (
                  ${candidates.supporterCount} = ${cursor.supporterCount}
                  AND ${candidates.averageScore} = ${cursor.averageScore}::numeric
                  AND ${candidates.ratingCount} = ${cursor.ratingCount}
                  AND ${candidates.latestWatchedDate} < ${cursor.latestWatchedDate}::date
                )

                OR (
                  ${candidates.supporterCount} = ${cursor.supporterCount}
                  AND ${candidates.averageScore} = ${cursor.averageScore}::numeric
                  AND ${candidates.ratingCount} = ${cursor.ratingCount}
                  AND ${candidates.latestWatchedDate} = ${cursor.latestWatchedDate}::date
                  AND ${candidates.mediaId} > ${cursor.mediaId}::uuid
                )
              )
            `
          : undefined
      )
      .orderBy(
        desc(candidates.supporterCount),
        desc(candidates.averageScore),
        desc(candidates.ratingCount),
        desc(candidates.latestWatchedDate),
        candidates.mediaId
      )
      .limit(limit);

    if (rows.length === 0) {
      return {
        items: [],
        nextCursor: null,
      };
    }

    const mediaIds = rows.map((row) => row.mediaId);

    const ratingRows = await db
      .select({
        mediaId: friendRatings.mediaId,
        userId: friendRatings.userId,
        displayName: friendProfile.displayName,
        username: friendProfile.username,
        avatarUrl: friendProfile.avatarUrl,
        score: friendRatings.score,
        watchedDate: friendRatings.watchedDate,
      })
      .from(follows)
      .innerJoin(friendRatings, eq(follows.followeeId, friendRatings.userId))
      .innerJoin(friendProfile, eq(friendRatings.userId, friendProfile.userId))
      .where(
        and(
          eq(follows.followerId, userId),
          inArray(friendRatings.mediaId, mediaIds)
        )
      )
      .orderBy(desc(friendRatings.score), desc(friendRatings.watchedDate));

    const ratingsByMediaId = new Map<string, TrustedRatingContext[]>();

    for (const rating of ratingRows) {
      const current = ratingsByMediaId.get(rating.mediaId) ?? [];

      current.push({
        userId: rating.userId,
        displayName: rating.displayName,
        username: rating.username,
        avatarUrl: rating.avatarUrl,
        score: rating.score,
        watchedDate: rating.watchedDate,
      });

      ratingsByMediaId.set(rating.mediaId, current);
    }

    const items: RecommendationItem[] = rows.map((row) => ({
      movieId: row.mediaId,
      movieTmdbId: row.movieTmdbId,
      movieTitle: row.movieTitle,
      movieYear: row.movieYear,
      moviePoster: row.moviePoster,
      movieBackdrop: row.movieBackdrop,
      movieRuntimeMinutes: row.movieRuntimeMinutes,
      movieOverview: row.movieOverview,
      kind: row.kind,

      ratingCount: row.ratingCount,
      supporterCount: row.supporterCount,
      averageScore: Number(row.averageScore),
      latestWatchedDate: row.latestWatchedDate,

      trustedRatingContext: ratingsByMediaId.get(row.mediaId) ?? [],
    }));

    const lastRow = rows.at(-1);

    const nextCursor =
      lastRow && rows.length === limit
        ? encodeRecommendationsCursor({
            supporterCount: lastRow.supporterCount,
            averageScore: lastRow.averageScore,
            ratingCount: lastRow.ratingCount,
            latestWatchedDate: lastRow.latestWatchedDate,
            mediaId: lastRow.mediaId,
          })
        : null;

    return {
      items,
      nextCursor,
    };
  });
}
