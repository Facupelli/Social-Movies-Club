'use server';

import { revalidateTag } from 'next/cache';
import { MediaService } from '@/modules/media-catalog/get-media-details/media.service';
import { RemoveFromWatchlistService } from '@/modules/watchlist/remove-from-watchlist/remove-from-watchlist.service';
import { validateRemoveMovieFromWatchlist } from '@/modules/watchlist/watchlist-validation';
import { withAuth } from '@/platform/auth/auth-server-action.middleware';
import { type ApiResponse, execute } from '@/shared/http/safe-execute';
import { NEXT_CACHE_TAGS } from '@/shared/utilities/app.constants';

export async function removeMovieFromWatchlist(
  _: ApiResponse<void>,
  formData: FormData
): Promise<ApiResponse<void>> {
  return await withAuth(async (session) => {
    const { movieTMDBId, userId, type } =
      validateRemoveMovieFromWatchlist(formData);

    if (userId !== session.user.id) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const mediaService = new MediaService();
    const removeFromWatchlistService = new RemoveFromWatchlistService();

    const result = await execute<void>(async () => {
      const movie = await mediaService.getMediaByTmdbIdentity(
        movieTMDBId,
        type
      );
      if (!movie) {
        throw new Error('Media not found');
      }
      await removeFromWatchlistService.remove(userId, movie.id);
    });

    if (result.success) {
      revalidateTag(NEXT_CACHE_TAGS.getUserWatchlist(userId));
    }

    return result;
  });
}
