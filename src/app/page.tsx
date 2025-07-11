'use client';

import { useState } from 'react';
import { MovieCard } from '@/components/movies/movie-card';
import { MovieGrid } from '@/components/movies/movie-grid';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import useDebounce from '@/movies/hooks/use-debounce';
import { useSearchMovies } from '@/movies/hooks/use-search-movies';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const debouncedSearchTerm = useDebounce(query, 500);

  return (
    <div className="flex-1 px-10 py-6">
      <div className="pb-6">
        <Input
          className="w-full bg-white"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar película..."
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
      <MovieGrid>
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
      </MovieGrid>
    );
  }

  if (error) {
    return <p>Error {JSON.stringify(error)}</p>;
  }

  return (
    <MovieGrid>
      {movies?.map((movie) => (
        <MovieCard key={movie.id} movie={movie}>
          <MovieCard.Poster />
          <CardContent className="flex flex-col gap-1 px-4 pt-2">
            <MovieCard.Title />
            <MovieCard.ReleaseDate />
          </CardContent>
          <CardFooter className="gap-2 px-4 pb-4">
            <MovieCard.AddToWatchlistButton />
            <MovieCard.Rate />
          </CardFooter>
        </MovieCard>
      ))}
    </MovieGrid>
  );
}
