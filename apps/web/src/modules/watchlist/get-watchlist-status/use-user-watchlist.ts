import { queryOptions } from '@tanstack/react-query';
import { personalizedQueryKeys } from '@/platform/react-query/personalized-query-keys';
import type { WatchlistStatusMap } from './watchlist-status.types';

export const watchlistStatusQueryKeys = {
  map: (viewerUserId: string | undefined) =>
    personalizedQueryKeys.resource(viewerUserId, 'watchlist-status'),
} as const;

async function getUserWatchlist(
  signal?: AbortSignal
): Promise<WatchlistStatusMap> {
  const response = await fetch('/api/user/watchlist', {
    cache: 'no-store',
    signal,
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

const getUserWatchlistQueryOptions = (userId: string | undefined) =>
  queryOptions({
    queryKey: watchlistStatusQueryKeys.map(userId),
    queryFn: ({ signal }) => getUserWatchlist(signal),
    enabled: Boolean(userId),
    refetchOnWindowFocus: false,
  });

export { getUserWatchlistQueryOptions, getUserWatchlist };
