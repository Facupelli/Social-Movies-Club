import type { MediaType } from '@/modules/media-catalog/media.type';

/** Browser-safe authoritative result of rating media. */
export type RateMediaResult = {
  mediaIdentity: {
    tmdbId: number;
    type: MediaType;
  };
  rating: {
    score: number;
    /** Calendar date in YYYY-MM-DD form, not an instant. */
    watchedDate: string;
  };
  removedFromWatchlist: boolean;
};
