import 'server-only';

import { dbWatchlistMovieToView } from '@/modules/media-catalog/get-media-details/media.adapters';
import type { MovieView } from '@/modules/media-catalog/movie-view';
import { getProfileWatchlist } from './watchlist.pg';

export async function getWatchlist(userId: string): Promise<MovieView[]> {
  const watchlist = await getProfileWatchlist(userId);
  return watchlist.map(dbWatchlistMovieToView);
}
