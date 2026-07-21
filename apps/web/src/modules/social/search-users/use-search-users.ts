'use client';

import { queryOptions, useQuery } from '@tanstack/react-query';
import {
  MAX_PROFILE_SEARCH_QUERY_LENGTH,
  MIN_PROFILE_SEARCH_QUERY_LENGTH,
  normalizeProfileSearchQuery,
} from '@/modules/profiles/search-profiles/profile-search-query';
import type { ProfileSearchResult } from '@/modules/profiles/search-profiles/profile-search.types';
import { personalizedQueryKeys } from '@/platform/react-query/personalized-query-keys';

export const profileSearchQueryKeys = {
  results: (viewerUserId: string, query: string) =>
    personalizedQueryKeys.resource(
      viewerUserId,
      'profile-search',
      normalizeProfileSearchQuery(query)
    ),
} as const;

async function getUsersByQuery(
  query: string,
  signal?: AbortSignal
): Promise<ProfileSearchResult[]> {
  const normalizedQuery = normalizeProfileSearchQuery(query);
  if (
    normalizedQuery.length < MIN_PROFILE_SEARCH_QUERY_LENGTH ||
    normalizedQuery.length > MAX_PROFILE_SEARCH_QUERY_LENGTH
  ) {
    return [];
  }

  const searchParams = new URLSearchParams({ q: normalizedQuery });
  const response = await fetch(`/api/users?${searchParams.toString()}`, {
    cache: 'no-store',
    signal,
  });
  if (!response.ok) {
    throw new Error('Unable to search users');
  }

  return response.json();
}

export function getProfileSearchQueryOptions(
  viewerUserId: string,
  query: string
) {
  const normalizedQuery = normalizeProfileSearchQuery(query);

  return queryOptions({
    queryKey: profileSearchQueryKeys.results(viewerUserId, normalizedQuery),
    queryFn: ({ signal }) => getUsersByQuery(normalizedQuery, signal),
    enabled:
      normalizedQuery.length >= MIN_PROFILE_SEARCH_QUERY_LENGTH &&
      normalizedQuery.length <= MAX_PROFILE_SEARCH_QUERY_LENGTH,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}

export function useSearchUsers(viewerUserId: string, query: string) {
  return useQuery(getProfileSearchQueryOptions(viewerUserId, query));
}

export { getUsersByQuery };
