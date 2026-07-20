import type { MediaType } from '@/modules/media-catalog/media.type';

export interface GetUserFeedParams {
  userId: string;
  limit?: number;
  cursor?: string | null;
  onlyUnseen?: boolean;
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
  movie_backdrop: string;
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
  movieBackdrop: string;
  movieTmdbId: number;
  movieOverview: string;
  movieType: MediaType;
  score: number;
  ratedAt: Date;
  seenAt: Date;
};
