import type { MovieView } from "@/components/movies/movie-card";
import type { UserRatings } from "@/users/user.types";
import type { TMDbMovieSearch } from "./movie.type";
import type { UserWatchlist } from "@/watchlist/watchlist.repository";

// From TMDb API call
export function apiMovieToView(m: TMDbMovieSearch): MovieView {
  return {
    tmdbId: m.id,
    title: m.title,
    year: m.year,
    posterPath: m.posterPath,
    overview: m.overview,
  };
}

// From Ratings local DB table
export function dbMovieToView(r: UserRatings): MovieView {
  return {
    tmdbId: r.tmdbId,
    title: r.title,
    year: r.year,
    posterPath: r.posterPath,
    score: r.score,
    overview: r.overview,
  };
}

// From Watchlist local DB table
export function dbWatchlistMovieToView(w: UserWatchlist): MovieView {
  return {
    tmdbId: w.movieTmdbId,
    title: w.movieTitle,
    year: w.movieYear,
    posterPath: w.moviePosterPath,
    overview: w.movieOverview,
  };
}
