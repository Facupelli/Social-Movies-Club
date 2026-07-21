import { queryOptions } from '@tanstack/react-query';
import { personalizedQueryKeys } from '@/platform/react-query/personalized-query-keys';
import type { WatchlistStatusMap } from '@/modules/watchlist/watchlist.types';

export const watchlistStatusQueryKeys = {
  map: (viewerUserId: string | undefined) =>
    personalizedQueryKeys.resource(viewerUserId, 'watchlist-status'),
} as const;

async function getViewerWatchlistStatusMap(
  signal?: AbortSignal
): Promise<WatchlistStatusMap> {
  const response = await fetch('/api/user/watchlist', {
    cache: 'no-store',
    signal,
  });
  if (!response.ok) {
    throw new Error('Unable to load watchlist status');
  }
  return response.json();
}

export function getWatchlistStatusQueryOptions(
  viewerUserId: string | undefined
) {
  return queryOptions({
    queryKey: watchlistStatusQueryKeys.map(viewerUserId),
    queryFn: ({ signal }) => getViewerWatchlistStatusMap(signal),
    enabled: Boolean(viewerUserId),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export { getViewerWatchlistStatusMap };
