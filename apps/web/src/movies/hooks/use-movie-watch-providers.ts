'use client';

import { useQuery } from '@tanstack/react-query';
import type { WatchProviderResult } from '@/infra/TMDB/types/watch-provider';

async function getMovieWatchProviders(
  movieId: number
): Promise<{ data: WatchProviderResult }> {
  const response = await fetch(`/api/movie/${movieId}/provider`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

export function useMovieWatchProviders(movieId: number, fetch = false) {
  return useQuery({
    queryKey: ['movie-provider', movieId],
    queryFn: () => getMovieWatchProviders(movieId),
    enabled: fetch,
    refetchOnWindowFocus: false,
  });
}
