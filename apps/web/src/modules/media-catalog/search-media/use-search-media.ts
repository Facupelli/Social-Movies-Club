'use client';

import { queryOptions, useQuery } from '@tanstack/react-query';
import type { MovieView } from '@/modules/media-catalog/movie-view';

export const MIN_MEDIA_SEARCH_QUERY_LENGTH = 3;
export const MAX_MEDIA_SEARCH_QUERY_LENGTH = 200;

export function normalizeMediaSearchQuery(query: string): string {
  return query.trim();
}

export const mediaSearchQueryKeys = {
  results: (query: string) =>
    ['media-search', { query: normalizeMediaSearchQuery(query) }] as const,
} as const;

async function getMediaByQuery(
  query: string,
  signal?: AbortSignal
): Promise<MovieView[]> {
  const normalizedQuery = normalizeMediaSearchQuery(query);
  if (
    normalizedQuery.length < MIN_MEDIA_SEARCH_QUERY_LENGTH ||
    normalizedQuery.length > MAX_MEDIA_SEARCH_QUERY_LENGTH
  ) {
    return [];
  }

  const searchParams = new URLSearchParams({ q: normalizedQuery });
  const response = await fetch(`/api/movie?${searchParams.toString()}`, {
    signal,
  });
  if (!response.ok) {
    throw new Error('Unable to search media');
  }

  return response.json();
}

export function getMediaSearchQueryOptions(query: string) {
  const normalizedQuery = normalizeMediaSearchQuery(query);

  return queryOptions({
    queryKey: mediaSearchQueryKeys.results(normalizedQuery),
    queryFn: ({ signal }) => getMediaByQuery(normalizedQuery, signal),
    enabled:
      normalizedQuery.length >= MIN_MEDIA_SEARCH_QUERY_LENGTH &&
      normalizedQuery.length <= MAX_MEDIA_SEARCH_QUERY_LENGTH,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}

export function useSearchMedia(query: string) {
  return useQuery(getMediaSearchQueryOptions(query));
}

export { getMediaByQuery };
