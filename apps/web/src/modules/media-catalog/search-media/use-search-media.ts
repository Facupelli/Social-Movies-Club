'use client';

import { useQuery } from '@tanstack/react-query';
import type { MovieView } from '@/modules/media-catalog/movie-view';

export const mediaSearchQueryKeys = {
  results: (query: string) => ['media-search', { query }] as const,
} as const;

async function getMediaByQuery(query: string): Promise<MovieView[]> {
  const searchParams = new URLSearchParams({ q: query });
  const response = await fetch(`/api/movie?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
}

const useSearchMedia = (query: string) => {
  return useQuery({
    queryKey: mediaSearchQueryKeys.results(query),
    queryFn: () => getMediaByQuery(query),
    enabled: query !== '',
    refetchOnWindowFocus: false,
  });
};

export { useSearchMedia, getMediaByQuery };
