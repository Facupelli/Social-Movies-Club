import type { MovieView } from "@/components/movies/movie-card";
import type { TMDbMovieSearch } from "./movie.type";
import type { UserRatings } from "@/users/user.types";

// From TMDb API call
export function apiMovieToView(m: TMDbMovieSearch): MovieView {
  return {
    id: m.id,
    title: m.title,
    year: m.year,
    posterPath: m.posterPath,
  };
}

// From Ratings local DB table
export function dbMovieToView(r: UserRatings): MovieView {
  return {
    id: r.tmdbId,
    title: r.title,
    year: r.year,
    posterPath: r.posterPath,
    score: r.score,
  };
}
