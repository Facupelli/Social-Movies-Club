import 'server-only';

import { getMediaIdentityKey } from '@/modules/media-catalog/media-identity';
import { getUserRatingMovies } from '@/modules/ratings/list-profile-ratings/profile-ratings.pg';
import type { RatingStatusMap } from './rating-status.types';

export async function getRatingStatusMap(
  viewerUserId: string
): Promise<RatingStatusMap> {
  const ratings = await getUserRatingMovies(viewerUserId);
  const statusMap: RatingStatusMap = {};

  for (const rating of ratings.data) {
    const identityKey = getMediaIdentityKey(rating.tmdbId, rating.type);
    statusMap[identityKey] ??= {
      isRated: true,
      score: rating.score,
      watchedDate: rating.watchedDate,
    };
  }

  return statusMap;
}
