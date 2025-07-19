import type { MovieView } from "@/components/movies/movie-card";
import type { UserRatings } from "@/users/user.types";
import type { UserWatchlist } from "@/watchlist/watchlist.repository";
import type { TMDbMediaMultiSearch } from "./media.type";

// From TMDb API call
export function apiMovieToView(m: TMDbMediaMultiSearch): MovieView {
	return {
		tmdbId: m.id,
		title: m.title,
		year: m.year,
		posterPath: m.posterPath,
		backdropPath: m.backdropPath,
		overview: m.overview,
		type: m.type,
	};
}

// From Ratings local DB table
export function dbMovieToView(r: UserRatings): MovieView {
	return {
		tmdbId: r.tmdbId,
		title: r.title,
		year: r.year,
		posterPath: r.posterPath,
		backdropPath: r.backdropPath,
		score: r.score,
		overview: r.overview,
		type: r.type,
	};
}

// From Watchlist local DB table
export function dbWatchlistMovieToView(w: UserWatchlist): MovieView {
	return {
		tmdbId: w.movieTmdbId,
		title: w.movieTitle,
		year: w.movieYear,
		posterPath: w.moviePosterPath,
		backdropPath: w.movieBackdropPath,
		overview: w.movieOverview,
		type: w.movieType,
	};
}
