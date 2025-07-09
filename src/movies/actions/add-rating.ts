'use server';

import { ObjectId } from 'mongodb';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { UserMovieService } from '@/users/user-movie.service';

export async function addRatingToMovie(movieId: number, rating: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Unauthorized');
  }

  const userId = new ObjectId(session.user.id);
  const userMovieService = new UserMovieService();

  const result = await userMovieService.addMovieToUser(userId, movieId, rating);
  return result;
}
