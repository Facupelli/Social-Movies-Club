import type { QueryClient } from '@tanstack/react-query';
import type { MediaType } from '@/modules/media-catalog/media.type';
import { getMediaIdentityKey } from '@/modules/media-catalog/media-identity';
import type { RatingStatusMap } from '@/modules/ratings/get-rating-status/rating-status.types';
import { ratingStatusQueryKeys } from '@/modules/ratings/get-rating-status/use-user-ratings';
import { profileRatingsQueryKeys } from '@/modules/ratings/list-profile-ratings/use-user-movies';
import { watchlistStatusQueryKeys } from '@/modules/watchlist/get-watchlist-status/use-user-watchlist';
import type { WatchlistStatusMap } from '@/modules/watchlist/watchlist.types';

export async function invalidateAfterRating(
  queryClient: QueryClient,
  userId: string
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: ratingStatusQueryKeys.map(userId),
    }),
    queryClient.invalidateQueries({
      queryKey: profileRatingsQueryKeys.viewerScope(userId),
    }),
  ]);
}

export function removeRatedMediaFromWatchlistStatus(
  queryClient: QueryClient,
  userId: string,
  tmdbId: number,
  type: MediaType
): void {
  const identityKey = getMediaIdentityKey(tmdbId, type);
  queryClient.setQueryData<WatchlistStatusMap>(
    watchlistStatusQueryKeys.map(userId),
    (current) => {
      if (!current) {
        return current;
      }
      const next = { ...current };
      delete next[identityKey];
      return next;
    }
  );
}

export async function optimisticallyRateMedia(
  queryClient: QueryClient,
  {
    userId,
    tmdbId,
    type,
    score,
    watchedDate,
  }: {
    userId: string;
    tmdbId: number;
    type: MediaType;
    score: number;
    watchedDate: string;
  }
): Promise<() => void> {
  const ratingsKey = ratingStatusQueryKeys.map(userId);

  await queryClient.cancelQueries({ queryKey: ratingsKey });

  const ratings = queryClient.getQueryData<RatingStatusMap>(ratingsKey);
  const identityKey = getMediaIdentityKey(tmdbId, type);
  const previousRating = ratings?.[identityKey];

  if (ratings) {
    queryClient.setQueryData<RatingStatusMap>(ratingsKey, {
      ...ratings,
      [identityKey]: {
        isRated: true,
        score,
        watchedDate: previousRating?.watchedDate ?? watchedDate,
      },
    });
  }

  return () => {
    if (ratings) {
      queryClient.setQueryData<RatingStatusMap>(ratingsKey, (current) => {
        const nextRatings = { ...current };
        if (previousRating) {
          nextRatings[identityKey] = previousRating;
        } else {
          delete nextRatings[identityKey];
        }
        return nextRatings;
      });
    }
  };
}
