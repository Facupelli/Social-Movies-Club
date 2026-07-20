import { waitUntil } from '@vercel/functions';
import type { PersistedRating } from './rating.pg';
import { fanOutRatingToFollowerTimelines } from './rating-timeline.pg';

export function projectRatingToFollowerTimelines(
  rating: PersistedRating
): Promise<void> {
  waitUntil(fanOutRatingToFollowerTimelines(rating));
  return Promise.resolve();
}
