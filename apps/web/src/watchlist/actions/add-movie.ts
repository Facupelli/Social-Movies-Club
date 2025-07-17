'use server';

import { revalidateTag } from 'next/cache';
import { NEXT_CACHE_TAGS } from '@/lib/app.constants';
import { withAuth } from '@/lib/auth-server-action.middleware';
import { UserMediaService } from '@/users/user-movie.service';
import { validateAddMovieToWatchlist } from '../watchlist-validation.service';

export async function addMovieToWatchlist(formData: FormData) {
  return await withAuth(async (session) => {
    const { movieTMDBId, userId, type } = validateAddMovieToWatchlist(formData);

    if (userId !== session.user.id) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const userMediaService = new UserMediaService();
    await userMediaService.addMediaToWatchlist(userId, movieTMDBId, type);

    revalidateTag(NEXT_CACHE_TAGS.getUserWatchlist(userId));

    return { success: true, error: '' };
  });
}
