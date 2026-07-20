import { queryOptions } from '@tanstack/react-query';
import type { UseUserMoviesMap } from '@/app/api/user/ratings/route';
import { QUERY_KEYS } from '@/shared/utilities/app.constants';

async function getUserRatings(signal?: AbortSignal): Promise<UseUserMoviesMap> {
  const response = await fetch('/api/user/ratings', {
    cache: 'no-store',
    signal,
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

const getUserRatingsQueryOptions = (userId: string | undefined) =>
  queryOptions({
    queryKey: QUERY_KEYS.getUserRatings(userId),
    queryFn: ({ signal }) => getUserRatings(signal),
    enabled: Boolean(userId),
    refetchOnWindowFocus: false,
  });

export { getUserRatingsQueryOptions, getUserRatings };
