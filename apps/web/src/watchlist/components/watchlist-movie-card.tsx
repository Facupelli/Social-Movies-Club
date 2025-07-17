"use client";

import { MovieCard, type MovieView } from "@/components/movies/movie-card";
import { CardContent } from "@/components/ui/card";

export function GridMovieCard({ movie }: { movie: MovieView }) {
  return (
    <MovieCard key={movie.tmdbId} movie={movie}>
      <MovieCard.Poster />
      <CardContent className="flex flex-col gap-1 px-4 py-2">
        <MovieCard.Title />
        <div className="flex items-center justify-between">
          <MovieCard.ReleaseDate />
          <MovieCard.WatchlistButton />
        </div>
        <MovieCard.WatchProviders />
      </CardContent>
    </MovieCard>
  );
}
