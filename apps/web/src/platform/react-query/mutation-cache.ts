import type { QueryClient } from '@tanstack/react-query';
import type { MediaType } from '@/modules/media-catalog/media.type';
import {
  getMediaIdentityKey,
  type MediaIdentityKey,
} from '@/modules/media-catalog/media-identity';
import { QUERY_KEYS } from '@/shared/utilities/app.constants';

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
      queryKey: QUERY_KEYS.getUserRatings(userId),
    }),
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.getUserMoviesScope(userId),
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
  const ratingsKey = QUERY_KEYS.getUserRatings(userId);

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
