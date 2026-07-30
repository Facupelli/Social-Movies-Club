import type { MediaKind } from '@/modules/media-catalog/media.type';
import type { MediaIdentityKey } from '@/modules/media-catalog/media-identity';
import type { MovieView } from '@/modules/media-catalog/movie-view';
import type { TrustedRatingSummary } from '@/modules/trusted-rating-context/trusted-rating-context.types';

export type WatchlistMediaIdentity = {
  tmdbId: number;
  kind: MediaKind;
};

export type WatchlistStatusMap = Record<MediaIdentityKey, boolean>;

export type WatchlistMutationResult = WatchlistMediaIdentity & {
  inWatchlist: boolean;
};

/** Persistence result consumed by the server-side watchlist adapter. */
export type WatchlistRow = {
  movieId: string;
  addedAt: Date | string;
  movieTmdbId: number;
  movieTitle: string;
  movieOverview: string;
  moviePosterPath: string;
  movieBackdropPath: string;
  movieYear: string;
  kind: MediaKind;
  movieRuntime?: number;
};

export const WATCHLIST_SORTS = [
  'recently-added',
  'trusted-rating',
  'most-rated',
] as const;

export type WatchlistSort = (typeof WATCHLIST_SORTS)[number];

export type WatchlistItem = {
  mediaId: string;
  addedAt: string;
  movie: MovieView;
};

export type EnrichedWatchlistItem = WatchlistItem & {
  trustedRating: TrustedRatingSummary;
};
