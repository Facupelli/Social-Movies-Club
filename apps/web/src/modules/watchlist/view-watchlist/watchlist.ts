import 'server-only';

import { dbWatchlistMovieToView } from '@/modules/media-catalog/get-media-details/media.adapters';
import type { WatchlistItem } from '@/modules/watchlist/watchlist.types';
import { getProfileWatchlist } from './watchlist.pg';

export async function getWatchlist(userId: string): Promise<WatchlistItem[]> {
  const watchlist = await getProfileWatchlist(userId);
  return watchlist.map((row) => ({
    mediaId: row.movieId,
    addedAt:
      row.addedAt instanceof Date
        ? row.addedAt.toISOString()
        : new Date(row.addedAt).toISOString(),
    movie: dbWatchlistMovieToView(row),
  }));
}
