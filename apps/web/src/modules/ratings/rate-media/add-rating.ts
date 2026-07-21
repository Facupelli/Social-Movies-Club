'use server';

import { refresh } from 'next/cache';
import {
  rateMedia,
  type RateMediaResult,
} from '@/modules/ratings/rate-media/rate-media';
import { withAuth } from '@/platform/auth/auth-server-action.middleware';
import { type ApiResponse, execute } from '@/shared/http/safe-execute';
import { validateMovieRating } from './rating-validation';

export async function addRatingToMovie(
  formData: FormData
): Promise<ApiResponse<RateMediaResult>> {
  return await withAuth(async (session) => {
    const result = await execute(async () => {
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

    if (result.success) {
      refresh();
    }

    return result;
  });
}
