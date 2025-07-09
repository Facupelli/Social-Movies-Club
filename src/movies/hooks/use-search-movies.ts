'use client';

import { useQuery } from '@tanstack/react-query';
import type { SearchMoviesResult } from '@/infra/TMDB/tmdb-repository';

async function getMoviesByQuery(query: string): Promise<SearchMoviesResult> {
  const response = await fetch(`/api/movie/?q=${query}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

const useSearchMovies = (query: string) => {
  return useQuery({
    queryKey: ['movies', query],
    queryFn: () => getMoviesByQuery(query),
    enabled: query !== '',
    refetchOnWindowFocus: false,
  });
};

export { useSearchMovies, getMoviesByQuery };
