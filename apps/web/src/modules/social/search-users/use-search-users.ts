'use client';

import { useQuery } from '@tanstack/react-query';
import { authClient } from '@/platform/auth/auth-client';
import type { ProfileSearchResult } from '@/modules/profiles/search-profiles/profile-search.pg';
import { personalizedQueryKeys } from '@/platform/react-query/personalized-query-keys';

export const profileSearchQueryKeys = {
  results: (viewerUserId: string | undefined, query: string) =>
    personalizedQueryKeys.resource(viewerUserId, 'profile-search', { query }),
} as const;

async function getUsersByQuery(
  query: string,
  signal?: AbortSignal
): Promise<ProfileSearchResult[]> {
  const response = await fetch(`/api/users/?q=${query}`, {
    cache: 'no-store',
    signal,
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
}

const useSearchUsers = (query: string) => {
  const { data: session } = authClient.useSession();
  const viewerUserId = session?.user.id;

  return useQuery({
    queryKey: profileSearchQueryKeys.results(viewerUserId, query),
    queryFn: ({ signal }) => getUsersByQuery(query, signal),
    enabled: Boolean(viewerUserId) && query !== '',
    refetchOnWindowFocus: false,
  });
};

export { useSearchUsers, getUsersByQuery };
