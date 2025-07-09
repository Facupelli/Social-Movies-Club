'use client';

import { useState } from 'react';
import { MovieCard } from '@/components/movies/movie-card';
import useDebounce from '@/movies/hooks/use-debounce';
import { useSearchMovies } from '@/movies/hooks/use-search-movies';
import type { UserViewModel } from '@/users/user.types';

export function HomeClient({ appUser }: { appUser: UserViewModel | null }) {
  const [query, setQuery] = useState('');
  const debouncedSearchTerm = useDebounce(query, 500);

  return (
    <div>
      <div>
        <input
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pulp Fiction"
          type="search"
        />
      </div>
      <MoviesList debouncedSearchTerm={debouncedSearchTerm} />

      <div className="grid gap-6 pt-10 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
        {appUser?.movies?.map((movie) => (
          <MovieCard key={movie.id} movie={movie}>
            <MovieCard.Poster />
            <div className="pt-2">
              <MovieCard.Title />
              <MovieCard.ReleaseDate />
            </div>
          </MovieCard>
        ))}
      </div>
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
    return <p>Loading...</p>;
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
