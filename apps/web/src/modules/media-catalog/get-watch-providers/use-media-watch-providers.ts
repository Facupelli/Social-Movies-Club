'use client';

import { queryOptions, useQuery } from '@tanstack/react-query';
import type { MediaType } from '@/modules/media-catalog/media.type';
import type { WatchProviderResponse } from './watch-provider.types';

export const watchProviderQueryKeys = {
  detail: (mediaId: number, type: MediaType) =>
    ['watch-providers', { mediaId, type }] as const,
} as const;

async function getMovieWatchProviders(
  mediaId: number,
  type: MediaType,
  signal?: AbortSignal
): Promise<WatchProviderResponse> {
  const searchParams = new URLSearchParams({ type });
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
  type: MediaType,
  enabled = false
) {
  return queryOptions({
    queryKey: watchProviderQueryKeys.detail(mediaId, type),
    queryFn: ({ signal }) => getMovieWatchProviders(mediaId, type, signal),
    enabled,
    staleTime: 12 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}

export function useMediaWatchProviders(
  mediaId: number,
  type: MediaType,
  enabled = false
) {
  return useQuery(getWatchProviderQueryOptions(mediaId, type, enabled));
}

export { getMovieWatchProviders };
