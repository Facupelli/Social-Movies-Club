import { dbWatchlistMovieToView } from '@/modules/media-catalog/get-media-details/media.adapters';
import type { MovieView } from '@/modules/media-catalog/movie-view';
import { WatchlistPgRepository } from './watchlist.pg.repository';

export class WatchlistService {
  constructor(
    private readonly repo: WatchlistPgRepository = new WatchlistPgRepository()
  ) {}

  async getWatchlist(userId: string): Promise<MovieView[]> {
    const watchlist = await this.repo.getWatchlist(userId);

    const watchlistMovieView = watchlist.map(dbWatchlistMovieToView);
    return watchlistMovieView;
  }
}
