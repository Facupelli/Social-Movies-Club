'use client';

import { useQuery } from '@tanstack/react-query';

async function getMoviesByQuery(query: string) {
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
  });
};

export { useSearchMovies, getMoviesByQuery };
