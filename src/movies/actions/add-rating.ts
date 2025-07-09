'use server';

import { UserMovieService } from '@/users/user-movie.service';

export async function addRatingToMovie(movieId: string, rating: number) {
  const userMovieService = new UserMovieService();

  const result = await userMovieService.addMovieToUser(
    'userId',
    movieId,
    rating
  );

  return result;
}
