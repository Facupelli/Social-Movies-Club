import type { MediaType } from "@/media/media.type";

export interface GetUserFeedParams {
	userId: string;
	limit?: number;
	cursor?: string | null;
	onlyUnseen?: boolean;
}

export type UserRatings = {
	movieId: string;
	score: number;
	createdAt: Date;
	title: string;
	year: string;
	posterPath: string;
	overview: string;
	tmdbId: number;
	type: MediaType;
};

export interface GetUserRatingMovies {
	data: UserRatings[];
	nextCursor: number | null;
}

export type FeedItemRaw = {
	feed_item_id: string;
	actor_id: string;
	actor_name: string;
	actor_image: string;
	actor_username?: string;
	media_id: number;
	movie_title: string;
	movie_year: string;
	movie_poster: string;
	movie_overview: string;
	movie_type: MediaType;
	movie_tmdb_id: number;
	score: number;
	rated_at: Date;
	seen_at: Date;
};

export type FeedItem = {
	feedItemId: string;
	actorId: string;
	actorName: string;
	actorImage: string;
	actorUsername?: string;
	movieId: number;
	movieTitle: string;
	movieYear: string;
	moviePoster: string;
	movieTmdbId: number;
	movieOverview: string;
	movieType: MediaType;
	score: number;
	ratedAt: Date;
	seenAt: Date;
};

export type UserMoviesBothRatedFilter = "true" | "false";
export type UserMoviesTypeFilter = "all" | "movie" | "tv";
export type UserMoviesSortBy = "score" | "createdAt";
export type UserMoviesSortOrder = "asc" | "desc";

// Client-side filter interface
export interface UserMoviesClientFilters {
	sortBy?: UserMoviesSortBy;
	sortOrder?: UserMoviesSortOrder;
	typeFilter?: UserMoviesTypeFilter;
	bothRated?: boolean;
}

// Server-side filter interface
export interface UserMoviesServerFilters extends UserMoviesClientFilters {
	limit?: number;
	offset?: number;
}

// URL search params interface
export interface UserMoviesUrlParams {
	sortBy?: string;
	sortOrder?: string;
	type?: string;
	bothRatedFilter?: string;
}
