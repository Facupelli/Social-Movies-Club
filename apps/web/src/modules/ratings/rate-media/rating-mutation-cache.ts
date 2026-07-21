import type { QueryClient } from '@tanstack/react-query';
import type { MediaType } from '@/modules/media-catalog/media.type';
import {
  getMediaIdentityKey,
  type MediaIdentityKey,
} from '@/modules/media-catalog/media-identity';
import { ratingStatusQueryKeys } from '@/modules/ratings/get-rating-status/use-user-ratings';
import { profileRatingsQueryKeys } from '@/modules/ratings/list-profile-ratings/use-user-movies';

type UserRatingsCache = Record<
  MediaIdentityKey,
  {
    isRated: boolean;
    score: number;
    watchedDate: string;
  }
>;

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

  const ratings = queryClient.getQueryData<UserRatingsCache>(ratingsKey);
  const identityKey = getMediaIdentityKey(tmdbId, type);
  const previousRating = ratings?.[identityKey];

  if (ratings) {
    queryClient.setQueryData<UserRatingsCache>(ratingsKey, {
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
      queryClient.setQueryData<UserRatingsCache>(ratingsKey, (current) => {
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
