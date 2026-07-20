'use server';

import { rateMedia } from '@/modules/ratings/rate-media/rate-media';
import { withAuth } from '@/platform/auth/auth-server-action.middleware';
import { type ApiResponse, execute } from '@/shared/http/safe-execute';
import { validateMovieRating } from './rating-validation';

export async function addRatingToMovie(
  formData: FormData
): Promise<ApiResponse<void>> {
  return await withAuth(async (session) => {
    return await execute<void>(async () => {
      const { movieTMDBId, rating, type, watchedDate } =
        validateMovieRating(formData);
      return await rateMedia({
        userId: session.user.id,
        tmdbId: movieTMDBId,
        rating,
        type,
        watchedDate,
      });
    });
  });
}
