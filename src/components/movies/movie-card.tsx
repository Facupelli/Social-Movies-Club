'use client';

import Image from 'next/image';
import { createContext, useContext } from 'react';
import type { MovieSummary } from '@/infra/TMDB/tmdb-repository';
import { RateDialog } from './rate-dialog';

const MovieCardContext = createContext<{ movie: MovieSummary | null }>({
  movie: null,
});

export function MovieCard({
  children,
  movie,
}: {
  children: React.ReactNode;
  movie: MovieSummary;
}) {
  return (
    <MovieCardContext.Provider value={{ movie }}>
      <div className="grid">{children}</div>
    </MovieCardContext.Provider>
  );
}

function Poster() {
  const { movie } = useContext(MovieCardContext);
  return movie?.posterPath ? (
    <div>
      <Image
        alt={movie.title}
        className="h-auto w-[200px]"
        height={350}
        src={`https://image.tmdb.org/t/p/original${movie.posterPath}`}
        unoptimized
        width={200}
      />
    </div>
  ) : (
    <div className="h-[350px] w-[200px] bg-gray-600" />
  );
}

function Title() {
  const { movie } = useContext(MovieCardContext);
  return <p>{movie?.title}</p>;
}

function ReleaseDate() {
  const { movie } = useContext(MovieCardContext);
  return <p className="text-gray-600 text-sm">{movie?.releaseDate}</p>;
}

function AddToWatchlistButton() {
  return <button type="button">Add to watch list</button>;
}

function Rate() {
  const { movie } = useContext(MovieCardContext);
  if (!movie) {
    return null;
  }

  return (
    <RateDialog
      movieId={movie.id}
      releaseDate={movie.releaseDate}
      title={movie.title}
    />
  );
}

MovieCard.Poster = Poster;
MovieCard.Title = Title;
MovieCard.ReleaseDate = ReleaseDate;
MovieCard.AddToWatchlistButton = AddToWatchlistButton;
MovieCard.Rate = Rate;
