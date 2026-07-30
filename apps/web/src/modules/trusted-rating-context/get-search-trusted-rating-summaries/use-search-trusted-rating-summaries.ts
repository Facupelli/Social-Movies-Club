'use client';

import { queryOptions, useQuery } from '@tanstack/react-query';
import { getMediaIdentityKey } from '@/modules/media-catalog/media-identity';
import type { MovieView } from '@/modules/media-catalog/movie-view';
import { personalizedQueryKeys } from '@/platform/react-query/personalized-query-keys';
import type { SearchTrustedRatingSummaryMap } from './get-search-trusted-rating-summaries';

export const trustedRatingQueryKeys = {
  viewerScope: (viewerUserId: string | undefined) =>
    personalizedQueryKeys.resource(viewerUserId, 'trusted-rating-context'),
  search: (viewerUserId: string | undefined, identities: readonly string[]) =>
    personalizedQueryKeys.resource(
      viewerUserId,
      'trusted-rating-context',
      'search',
      identities
    ),
} as const;

export function getSearchTrustedRatingQueryOptions(
  viewerUserId: string | undefined,
  movies: readonly MovieView[]
) {
  const uniqueMovies = [
    ...new Map(
      movies.map((movie) => [
        getMediaIdentityKey(movie.tmdbId, movie.kind),
        movie,
      ])
    ).values(),
  ];
  const identityKeys = uniqueMovies
    .map((movie) => getMediaIdentityKey(movie.tmdbId, movie.kind))
    .sort();

  return queryOptions({
    queryKey: trustedRatingQueryKeys.search(viewerUserId, identityKeys),
    queryFn: async ({ signal }) => {
      const searchParams = new URLSearchParams();
      for (const { kind, tmdbId } of uniqueMovies) {
        searchParams.append('identity', getMediaIdentityKey(tmdbId, kind));
      }
      const response = await fetch(
        `/api/user/trusted-rating-context/search?${searchParams.toString()}`,
        { signal }
      );
      if (!response.ok) {
        throw new Error('Unable to load trusted ratings');
      }
      return (await response.json()) as SearchTrustedRatingSummaryMap;
    },
    enabled: Boolean(viewerUserId) && uniqueMovies.length > 0,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useSearchTrustedRatingSummaries(
  viewerUserId: string | undefined,
  movies: readonly MovieView[]
) {
  return useQuery(getSearchTrustedRatingQueryOptions(viewerUserId, movies));
}
