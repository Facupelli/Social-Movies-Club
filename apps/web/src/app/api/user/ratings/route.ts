import { headers } from 'next/headers';
import {
  getMediaIdentityKey,
  type MediaIdentityKey,
} from '@/modules/media-catalog/media-identity';
import { ProfileRatingsService } from '@/modules/ratings/list-profile-ratings/profile-ratings.service';
import type { GetUserRatingMovies } from '@/modules/ratings/list-profile-ratings/profile-ratings.types';
import { auth } from '@/platform/auth/auth';
import {
  authenticatedJson,
  unauthorizedJson,
} from '@/shared/http/authenticated-response';

export type UseUserMoviesMap = Record<
  MediaIdentityKey,
  { isRated: boolean; score: number; watchedDate: string }
>;

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return unauthorizedJson();
  }

  const ratingsService = new ProfileRatingsService();

  const res: GetUserRatingMovies = await ratingsService.getUserRatingMovies(
    session.user.id
  );

  const statusMap: UseUserMoviesMap = {};

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
