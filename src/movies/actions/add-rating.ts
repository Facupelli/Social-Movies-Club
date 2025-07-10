'use server';

import { ObjectId } from 'mongodb';
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

  const movieId = Number(formData.get('movieId'));
  const rating = Number(formData.get('rating'));

  if (!(movieId && rating)) {
    return { success: false, error: 'Missing movie ID or rating' };
  }

  const userId = new ObjectId(session.user.id);
  const userMovieService = new UserMovieService();

  await userMovieService.addMovieToUser(userId, movieId, rating);
  return { success: true };
}
