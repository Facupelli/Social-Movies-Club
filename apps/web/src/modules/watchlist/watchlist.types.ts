import type { MediaKind } from '@/modules/media-catalog/media.type';
import type { MediaIdentityKey } from '@/modules/media-catalog/media-identity';

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
  movieTmdbId: number;
  movieTitle: string;
  movieOverview: string;
  moviePosterPath: string;
  movieBackdropPath: string;
  movieYear: string;
  kind: MediaKind;
  movieRuntime?: number;
};
