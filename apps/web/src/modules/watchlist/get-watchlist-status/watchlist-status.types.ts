import type {
  MediaIdentityKey,
} from '@/modules/media-catalog/media-identity';
import type { MediaType } from '@/modules/media-catalog/media.type';

export type WatchlistMediaIdentity = {
  tmdbId: number;
  type: MediaType;
};

export type WatchlistStatusMap = Record<MediaIdentityKey, boolean>;
