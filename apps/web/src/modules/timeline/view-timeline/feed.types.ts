import type { MediaType } from '@/modules/media-catalog/media.type';

export interface GetUserFeedParams {
  userId: string;
  limit?: number;
  cursor?: string | null;
  onlyUnseen?: boolean;
}

export type FeedItem = {
  feedItemId: string;
  actorId: string;
  actorName: string;
  actorImage: string | null;
  actorUsername: string | null;
  movieId: string;
  movieTitle: string;
  movieYear: string;
  moviePoster: string;
  movieBackdrop: string;
  movieTmdbId: number;
  movieOverview: string;
  movieType: MediaType;
  score: number;
  ratedAt: string;
  seenAt: string | null;
};

export type UserFeedPage = {
  items: FeedItem[];
  nextCursor: string | null;
};
