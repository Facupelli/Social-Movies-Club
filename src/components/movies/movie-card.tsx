'use client';

import clsx from 'clsx';
import { Bookmark } from 'lucide-react';
import Image from 'next/image';
import { createContext, useContext } from 'react';
import { cn } from '@/lib/utils';
import { useMovieWatchProviders } from '@/movies/hooks/use-movie-watch-providers';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { RateDialog } from './rate-dialog';

export interface MovieView {
  id: number; // aquí usamos el TMDB‐ID siempre
  title: string;
  year: string;
  posterPath: string;
  score?: number; // opcional, sólo existe si viene de ratings
}

type MovieCardContextType = {
  movie: MovieView;
};

const MovieCardContext = createContext<MovieCardContextType | undefined>(
  undefined
);

function useMovieCardContext() {
  const context = useContext(MovieCardContext);
  if (!context) {
    throw new Error(
      'useMovieCardContext must be used within a MovieCard.Provider'
    );
  }
  return context;
}

export function MovieCard({
  children,
  movie,
}: {
  children: React.ReactNode;
  movie: MovieView;
}) {
  return (
    <MovieCardContext.Provider value={{ movie }}>
      <div className="grid">{children}</div>
    </MovieCardContext.Provider>
  );
}

function Poster({ size = 'default' }: { size?: 'small' | 'default' }) {
  const { movie } = useMovieCardContext();

  const dimensions =
    size === 'small' ? { width: 80, height: 120 } : { width: 200, height: 300 };

  return movie.posterPath ? (
    <div>
      <Image
        alt={movie.title}
        className={clsx('h-auto rounded-xs')}
        height={dimensions.height}
        src={`https://image.tmdb.org/t/p/original${movie.posterPath}`}
        unoptimized
        width={dimensions.width}
      />
    </div>
  ) : (
    <div className="h-[350px] w-[200px] bg-gray-600" />
  );
}

function Title({ className }: { className?: string }) {
  const { movie } = useMovieCardContext();
  return <p className={cn('', className)}>{movie.title}</p>;
}

function ReleaseDate() {
  const { movie } = useMovieCardContext();
  return <p className="text-gray-600 text-sm">{movie.year}</p>;
}

function Rating() {
  const { movie } = useMovieCardContext();

  if (!movie.score) {
    return null;
  }

  return (
    <div className="flex size-7 items-center justify-center rounded bg-blue-300">
      <p className="font-bold text-sm">{movie.score}</p>
    </div>
  );
}

function WatchProviders() {
  const { movie } = useMovieCardContext();
  const {
    data: watchProviders,
    isLoading,
    refetch,
  } = useMovieWatchProviders(movie.id);

  return (
    <div className="space-y-2">
      <Button className="h-auto p-0" onClick={() => refetch()} variant="link">
        Donde ver?
      </Button>

      {isLoading && (
        <div className="flex flex-wrap gap-1 pt-2">
          {[...Array(3)].map((_, idx) => (
            // biome-ignore lint:reason
            <div key={idx}>
              <Skeleton className="size-[30px] rounded-sm" />{' '}
            </div>
          ))}
        </div>
      )}

      {watchProviders?.data && (
        <div className="flex flex-wrap gap-1">
          {watchProviders?.data.flatrate.map((provider) => (
            <div key={provider.provider_id}>
              <Image
                alt={provider.provider_name}
                className={clsx('h-auto rounded-sm')}
                height={30}
                src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                unoptimized
                width={30}
              />
            </div>
          ))}
        </div>
      )}

      {/* JustWatch Attribution */}
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <span>Powered by</span>
        <a
          className="inline-flex items-center gap-1 transition-opacity hover:opacity-80"
          href={'todo'}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Image
            alt="JustWatch"
            className="h-auto"
            height={10}
            src="https://widget.justwatch.com/assets/JW_logo_color_10px.svg"
            width={60}
          />
        </a>
      </div>
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
  const { movie } = useMovieCardContext();

  return (
    <RateDialog movieTMDBId={movie.id} title={movie.title} year={movie.year} />
  );
}

MovieCard.Poster = Poster;
MovieCard.Title = Title;
MovieCard.ReleaseDate = ReleaseDate;
MovieCard.AddToWatchlistButton = AddToWatchlistButton;
MovieCard.Rate = Rate;
MovieCard.Rating = Rating;
MovieCard.WatchProviders = WatchProviders;
