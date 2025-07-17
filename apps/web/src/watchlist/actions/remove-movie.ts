'use server';

import { revalidateTag } from 'next/cache';
import { NEXT_CACHE_TAGS } from '@/lib/app.constants';
import { withAuth } from '@/lib/auth-server-action.middleware';
import { MediaService } from '@/movies/movie.service';
import { WatchlistService } from '../watchlist.service';
import { validateRemoveMovieFromWatchlist } from '../watchlist-validation.service';

export async function removeMovieFromWatchlist(
  _: { success: boolean; error?: string },
  formData: FormData
) {
  return await withAuth(async (session) => {
    const { movieTMDBId, userId } = validateRemoveMovieFromWatchlist(formData);

    if (userId !== session.user.id) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const mediaService = new MediaService();
    const watchlistService = new WatchlistService();

    const movie = await mediaService.getMediaByTMDBId(movieTMDBId);
    await watchlistService.removeMedia(userId, movie.id);

    revalidateTag(NEXT_CACHE_TAGS.getUserWatchlist(userId));

    return { success: true, error: '' };
  });
}
