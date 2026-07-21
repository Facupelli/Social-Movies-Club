import { headers } from 'next/headers';
import { getMediaIdentityKey } from '@/modules/media-catalog/media-identity';
import type { RatingStatusMap } from '@/modules/ratings/get-rating-status/rating-status.types';
import { getUserRatingMovies } from '@/modules/ratings/list-profile-ratings/profile-ratings.pg';
import type { GetUserRatingMovies } from '@/modules/ratings/list-profile-ratings/profile-ratings.types';
import { auth } from '@/platform/auth/auth';
import {
  authenticatedJson,
  unauthorizedJson,
} from '@/shared/http/authenticated-response';

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return unauthorizedJson();
  }

  const res: GetUserRatingMovies = await getUserRatingMovies(session.user.id);

  const statusMap: RatingStatusMap = {};

  for (const result of res.data) {
    const identityKey = getMediaIdentityKey(result.tmdbId, result.type);
    if (statusMap[identityKey]) {
      continue;
    }

    statusMap[identityKey] = {
      isRated: true,
      score: result.score,
      watchedDate: result.watchedDate,
    };
  }

  return authenticatedJson(statusMap);
}
