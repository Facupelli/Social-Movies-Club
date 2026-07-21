import type { MediaIdentityKey } from '@/modules/media-catalog/media-identity';
import type { MediaType } from '@/modules/media-catalog/media.type';

export type WatchlistMediaIdentity = {
  tmdbId: number;
  type: MediaType;
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
  movieType: MediaType;
  movieRuntime?: number;
};
