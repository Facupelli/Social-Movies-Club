'use server';

import { refresh } from 'next/cache';
import { removeMediaFromViewerWatchlist } from '@/modules/watchlist/watchlist-mutations';
import type { WatchlistMutationResult } from '@/modules/watchlist/watchlist.types';
import { validateWatchlistMutation } from '@/modules/watchlist/watchlist-validation';
import { withAuth } from '@/platform/auth/auth-server-action.middleware';
import { type ApiResponse, execute } from '@/shared/http/safe-execute';

export async function removeMovieFromWatchlist(
  _: ApiResponse<WatchlistMutationResult>,
  formData: FormData
): Promise<ApiResponse<WatchlistMutationResult>> {
  return await withAuth(async (session) => {
    const result = await execute(() => {
      const { movieTMDBId, type } = validateWatchlistMutation(formData);
      return removeMediaFromViewerWatchlist(
        session.user.id,
        movieTMDBId,
        type
      );
    });

    if (result.success) {
      refresh();
    }

    return result;
  });
}
