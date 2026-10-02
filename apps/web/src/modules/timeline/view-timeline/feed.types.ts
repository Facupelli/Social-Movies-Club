import type { MediaKind } from '@/modules/media-catalog/media.type';
import type { TimelineTrustedRatingContext } from '@/modules/trusted-rating-context/trusted-rating-context.types';
import type { FeedCursor } from './feed-cursor';

export interface GetUserFeedParams {
  userId: string;
  limit?: number;
  cursor?: FeedCursor | null;
  onlyUnseen?: boolean;
}

export type FeedViewerRating = {
  score: number;
  watchedDate: string | null;
};

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
  movieRuntimeMinutes: number | null;
  movieTmdbId: number;
  movieOverview: string;
  kind: MediaKind;
  score: number;
  viewerRating: FeedViewerRating | null;
  occurredAt: string;
  ratedAt: string;
  seenAt: string | null;
  trustedRatingContext: TimelineTrustedRatingContext | null;
};

export type UserFeedPage = {
  items: FeedItem[];
  nextCursor: string | null;
};
