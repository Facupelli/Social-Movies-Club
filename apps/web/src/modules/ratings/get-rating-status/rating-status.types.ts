import type { MediaIdentityKey } from '@/modules/media-catalog/media-identity';

export type RatingStatusMap = Record<
  MediaIdentityKey,
  { isRated: boolean; score: number; watchedDate: string }
>;
