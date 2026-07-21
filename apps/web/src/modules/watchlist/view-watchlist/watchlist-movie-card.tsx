import {
  MovieCard,
  MoviePoster,
  MovieReleaseDate,
  MovieRuntime,
  MovieTitle,
} from '@/modules/media-catalog/components/movie-card';
import { MovieWatchProviders } from '@/modules/media-catalog/get-watch-providers/movie-watch-providers';
import type { MovieView } from '@/modules/media-catalog/movie-view';
import { RateDialog } from '@/modules/ratings/rate-media/rate-dialog';
import { AddToWatchlistButton } from '@/modules/watchlist/add-to-watchlist/add-to-watchlist-button';
import { CardContent } from '@/shared/ui/card';

export function GridMovieCard({
  movie,
  isOwner,
}: {
  movie: MovieView;
  isOwner: boolean;
}) {
  return (
    <MovieCard>
      <MoviePoster posterPath={movie.posterPath} title={movie.title} />
      <CardContent className="flex flex-col gap-1 px-4 py-2">
        <MovieTitle title={movie.title} />
        <div className="flex items-center justify-between">
          <div className="flex w-full items-center justify-between gap-2">
            <MovieReleaseDate year={movie.year} />
            <MovieRuntime runtime={movie.runtime} type={movie.type} />
          </div>
          <AddToWatchlistButton tmdbId={movie.tmdbId} type={movie.type} />
        </div>
        <MovieWatchProviders tmdbId={movie.tmdbId} type={movie.type} />

        {isOwner && (
          <div>
            <RateDialog
              posterPath={movie.posterPath}
              title={movie.title}
              tmdbId={movie.tmdbId}
              type={movie.type}
              year={movie.year}
            />
          </div>
        )}
      </CardContent>
    </MovieCard>
  );
}
