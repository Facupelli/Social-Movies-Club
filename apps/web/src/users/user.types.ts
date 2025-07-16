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
  movie_id: number;
  movie_title: string;
  movie_year: string;
  movie_poster: string;
  movie_overview: string;
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
  score: number;
  ratedAt: Date;
  seenAt: Date;
};

export type UserMoviesSortBy = "score" | "createdAt";
export type UserMoviesSortOrder = "asc" | "desc";

export interface GetUserRatingMoviesFilters {
  field?: UserMoviesSortBy;
  dir?: UserMoviesSortOrder;
  limit?: number;
  offset?: number;
}
