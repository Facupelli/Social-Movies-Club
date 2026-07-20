'use client';

import { useQuery } from '@tanstack/react-query';
import { authClient } from '@/platform/auth/auth-client';
import type { ProfileSearchResult } from '@/modules/profiles/search-profiles/profile-search.pg';
import { QUERY_KEYS } from '@/shared/utilities/app.constants';

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

  return useQuery({
    queryKey: QUERY_KEYS.getSearchUsers(query),
    queryFn: ({ signal }) => getUsersByQuery(query, signal),
    enabled: Boolean(session?.user.id) && query !== '',
    refetchOnWindowFocus: false,
  });
};

export { useSearchUsers, getUsersByQuery };
