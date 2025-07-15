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
  tmdbId: number;
};

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
  movieOverview: string;
  score: number;
  ratedAt: Date;
  seenAt: Date;
};
