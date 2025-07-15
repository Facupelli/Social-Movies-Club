import type { MovieView } from "@/components/movies/movie-card";
import type { UserRatings } from "@/users/user.types";
import type { TMDbMovieSearch } from "./movie.type";

// From TMDb API call
export function apiMovieToView(m: TMDbMovieSearch): MovieView {
  return {
    id: m.id,
    title: m.title,
    year: m.year,
    posterPath: m.posterPath,
    overview: m.overview,
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
    overview: r.overview,
  };
}
