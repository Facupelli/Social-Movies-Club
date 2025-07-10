'use client';

import { useState } from 'react';
import { MovieCard } from '@/components/movies/movie-card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import useDebounce from '@/movies/hooks/use-debounce';
import { useSearchMovies } from '@/movies/hooks/use-search-movies';

export function HomeClient() {
  const [query, setQuery] = useState('');
  const debouncedSearchTerm = useDebounce(query, 500);

  return (
    <div className="flex-1 bg-neutral-300 px-10 py-6">
      <div className="pb-6">
        <Input
          className="w-full bg-white"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a movie..."
          type="search"
        />
      </div>

      <MoviesList debouncedSearchTerm={debouncedSearchTerm} />
    </div>
  );
}

function MoviesList({ debouncedSearchTerm }: { debouncedSearchTerm: string }) {
  const {
    data: movies,
    isLoading,
    error,
  } = useSearchMovies(debouncedSearchTerm);

  if (isLoading) {
    return (
      <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
        {[...Array(10)].map((_, i) => (
          // biome-ignore lint: reason
          <div key={i}>
            <Skeleton className="h-[300px] w-[200px] rounded-xs" />
            <div className="grid gap-1 pt-2">
              <Skeleton className="h-5 w-[120px]" />
              <Skeleton className="h-5 w-[70px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p>Error {JSON.stringify(error)}</p>;
  }

  return (
    <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
      {movies?.data?.map((movie) => (
        <MovieCard key={movie.id} movie={movie}>
          <MovieCard.Poster />
          <div className="pt-2">
            <MovieCard.Title />
            <MovieCard.ReleaseDate />
          </div>
          <div className="flex gap-2">
            <MovieCard.AddToWatchlistButton />
            <MovieCard.Rate />
          </div>
        </MovieCard>
      ))}
    </div>
  );
}
