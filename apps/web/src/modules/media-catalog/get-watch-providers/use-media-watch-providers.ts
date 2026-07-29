'use client';

import { queryOptions, useQuery } from '@tanstack/react-query';
import type { MediaKind } from '@/modules/media-catalog/media.type';
import type { WatchProviderResponse } from './watch-provider.types';

export const watchProviderQueryKeys = {
  detail: (mediaId: number, kind: MediaKind) =>
    ['watch-providers', { mediaId, kind }] as const,
} as const;

async function getMovieWatchProviders(
  mediaId: number,
  kind: MediaKind,
  signal?: AbortSignal
): Promise<WatchProviderResponse> {
  const searchParams = new URLSearchParams({ kind });
  const response = await fetch(
    `/api/movie/${mediaId}/provider?${searchParams.toString()}`,
    { signal }
  );
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
    queryFn: ({ signal }) => getMovieWatchProviders(mediaId, kind, signal),
    enabled,
    staleTime: 12 * 60 * 60 * 1000,
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

export { getMovieWatchProviders };
