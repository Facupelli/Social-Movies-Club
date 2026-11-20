'use client';

import { queryOptions, useQuery } from '@tanstack/react-query';
import { MEDIA_AVAILABILITY_FRESHNESS_MS } from '@/modules/media-availability/media-availability.constants';
import type { WatchAvailability } from '@/modules/media-availability/media-availability.types';
import type { MediaKind } from '@/modules/media-catalog/media.type';

const MAX_CLIENT_FRESHNESS_MS = 12 * 60 * 60 * 1000;

export class WatchAvailabilityRefreshingError extends Error {}

export const watchProviderQueryKeys = {
  detail: (mediaId: number, kind: MediaKind) =>
    ['watch-providers', { mediaId, kind }] as const,
} as const;

async function getMediaAvailability(
  mediaId: number,
  kind: MediaKind,
  signal?: AbortSignal
): Promise<WatchAvailability> {
  const searchParams = new URLSearchParams({ kind });
  const response = await fetch(
    `/api/movie/${mediaId}/provider?${searchParams.toString()}`,
    { signal }
  );
  if (response.status === 503) {
    throw new WatchAvailabilityRefreshingError(
      'Watch providers are refreshing'
    );
  }
  if (!response.ok) {
    throw new Error('Unable to load watch providers');
  }
  return response.json();
}

export function getWatchProviderQueryOptions(
  mediaId: number,
  kind: MediaKind,
  enabled = false
) {
  return queryOptions({
    queryKey: watchProviderQueryKeys.detail(mediaId, kind),
    queryFn: ({ signal }) => getMediaAvailability(mediaId, kind, signal),
    enabled,
    staleTime: ({ state }) =>
      state.data
        ? Math.max(
            0,
            Math.min(
              MAX_CLIENT_FRESHNESS_MS,
              Date.parse(state.data.fetchedAt) +
                MEDIA_AVAILABILITY_FRESHNESS_MS -
                state.dataUpdatedAt
            )
          )
        : 0,
    retry: (failureCount, error) =>
      error instanceof WatchAvailabilityRefreshingError && failureCount < 3,
    retryDelay: 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}

export function useMediaWatchProviders(
  mediaId: number,
  kind: MediaKind,
  enabled = false
) {
  return useQuery(getWatchProviderQueryOptions(mediaId, kind, enabled));
}

export { getMediaAvailability };
