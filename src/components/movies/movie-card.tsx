'use client';

import { Bookmark } from 'lucide-react';
import Image from 'next/image';
import { createContext, useContext } from 'react';
import type { MovieViewModel } from '@/movies/movie.type';
import { RateDialog } from './rate-dialog';

const MovieCardContext = createContext<{
  movie: MovieViewModel | null;
}>({
  movie: null,
});

export function MovieCard({
  children,
  movie,
}: {
  children: React.ReactNode;
  movie: MovieViewModel;
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
        className="h-auto w-[200px] rounded-xs"
        height={300}
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

function Rating() {
  const { movie } = useContext(MovieCardContext);

  return (
    <div className="flex size-7 items-center justify-center rounded bg-blue-300">
      <p className="font-bold text-sm">{movie?.rating}</p>
    </div>
  );
}

function AddToWatchlistButton() {
  return (
    <button type="button">
      <Bookmark />
    </button>
  );
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
MovieCard.Rating = Rating;
