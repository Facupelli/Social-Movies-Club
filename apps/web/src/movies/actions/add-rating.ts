'use server';

import { withAuth } from '@/lib/auth-server-action.middleware';
import { UserMediaService } from '@/users/user-movie.service';
import { validateMovieRating } from '../movie-validation.services';

export async function addRatingToMovie(formData: FormData) {
  return await withAuth(async (session) => {
    const { movieTMDBId, rating, type } = validateMovieRating(formData);

    const userMediaService = new UserMediaService();
    await userMediaService.rateMovie({
      userId: session.user.id,
      tmdbId: movieTMDBId,
      rating,
      type,
    });

    return { success: true, error: '' };
  });
}
