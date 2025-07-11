'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { UserMovieService } from '@/users/user-movie.service';

export async function addRatingToMovie(
  _: { success: boolean; error?: string },
  formData: FormData
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  const movieTMDBId = Number(formData.get('movieTMDBId'));
  const rating = Number(formData.get('rating'));

  if (!(movieTMDBId && rating)) {
    return { success: false, error: 'Missing movie ID or rating' };
  }

  const userMovieService = new UserMovieService();

  await userMovieService.addMovieToUser(session.user.id, movieTMDBId, rating);
  return { success: true };
}
