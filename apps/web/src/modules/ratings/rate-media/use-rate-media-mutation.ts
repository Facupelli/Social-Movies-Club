'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import type { MediaKind } from '@/modules/media-catalog/media.type';
import { getMediaIdentityKey } from '@/modules/media-catalog/media-identity';
import type { RatingStatusMap } from '@/modules/ratings/get-rating-status/rating-status.types';
import { ratingStatusQueryKeys } from '@/modules/ratings/get-rating-status/use-user-ratings';
import { profileRatingsQueryKeys } from '@/modules/ratings/list-profile-ratings/use-user-movies';
import { addRatingToMovie } from '@/modules/ratings/rate-media/add-rating';
import { addSilentRatingToMovie } from '@/modules/ratings/rate-media/add-silent-rating';
import type {
  RateMediaResult,
  RatingPublicationMode,
} from '@/modules/ratings/rating-mutation.types';
import { recommendationsQueryKeys } from '@/modules/recommendations/use-user-recommendations';
import { watchlistStatusQueryKeys } from '@/modules/watchlist/get-watchlist-status/use-user-watchlist';
import type { WatchlistStatusMap } from '@/modules/watchlist/watchlist.types';
import type { ApiResponse } from '@/shared/http/safe-execute';

type OptimisticRating = {
  tmdbId: number;
  kind: MediaKind;
  score: number;
  watchedDate: string;
};

type RateMediaMutationOptions = {
  publicationMode: RatingPublicationMode;
  recommendationCache: 'invalidate' | 'preserve';
};

/** Owns every browser cache effect caused by rating media. */
export function useRateMediaMutation(
  viewerUserId: string | undefined,
  options: RateMediaMutationOptions
) {
  const queryClient = useQueryClient();
  const rateMediaAction =
    options.publicationMode === 'publish'
      ? addRatingToMovie
      : addSilentRatingToMovie;
  const latestMutation = useRef(0);

  return async function mutateRateMedia(
    formData: FormData,
    optimistic: OptimisticRating
  ): Promise<ApiResponse<RateMediaResult>> {
    const mutationId = ++latestMutation.current;
    const ratingsKey = ratingStatusQueryKeys.map(viewerUserId);
    const identityKey = getMediaIdentityKey(optimistic.tmdbId, optimistic.kind);

    await queryClient.cancelQueries({ queryKey: ratingsKey, exact: true });
    const previousRatings =
      queryClient.getQueryData<RatingStatusMap>(ratingsKey);

    if (viewerUserId) {
      queryClient.setQueryData<RatingStatusMap>(ratingsKey, {
        ...(previousRatings ?? {}),
        [identityKey]: {
          isRated: true,
          score: optimistic.score,
          watchedDate: optimistic.watchedDate,
        },
      });
    }

    const rollback = () => {
      if (!(viewerUserId && latestMutation.current === mutationId)) {
        return;
      }
      if (previousRatings) {
        queryClient.setQueryData(ratingsKey, previousRatings);
      } else {
        queryClient.removeQueries({ queryKey: ratingsKey, exact: true });
      }
    };

    try {
      const result = await rateMediaAction(formData);
      if (!result.success) {
        rollback();
        return result;
      }

      if (latestMutation.current !== mutationId) {
        return result;
      }

      if (!viewerUserId) {
        return result;
      }

      const resultIdentityKey = getMediaIdentityKey(
        result.data.mediaIdentity.tmdbId,
        result.data.mediaIdentity.kind
      );
      queryClient.setQueryData<RatingStatusMap>(ratingsKey, (current) => ({
        ...(current ?? {}),
        [resultIdentityKey]: {
          isRated: true,
          score: result.data.rating.score,
          watchedDate: result.data.rating.watchedDate,
        },
      }));

      if (result.data.removedFromWatchlist) {
        queryClient.setQueryData<WatchlistStatusMap>(
          watchlistStatusQueryKeys.map(viewerUserId),
          (current) => {
            if (!current) {
              return current;
            }
            const next = { ...current };
            delete next[resultIdentityKey];
            return next;
          }
        );
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: profileRatingsQueryKeys.viewerScope(viewerUserId),
        }),
        ...(options.recommendationCache === 'invalidate'
          ? [
              queryClient.invalidateQueries({
                queryKey: recommendationsQueryKeys.infinite(viewerUserId),
              }),
            ]
          : []),
      ]);
      return result;
    } catch (error) {
      rollback();
      throw error;
    }
  };
}
