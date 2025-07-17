import type { MovieView } from '@/components/movies/movie-card';
import { dbWatchlistMovieToView } from '@/movies/movie.adapters';
import { WatchlistPgRepository } from './watchlist.repository';

export class WatchlistService {
  constructor(
    private readonly repo: WatchlistPgRepository = new WatchlistPgRepository()
  ) {}

  async addMedia(userId: string, mediaId: bigint) {
    return await this.repo.addMedia(userId, mediaId);
  }

  async removeMedia(userId: string, mediaId: string) {
    return await this.repo.removeMedia(userId, mediaId);
  }

  async getWatchlist(userId: string): Promise<MovieView[]> {
    const watchlist = await this.repo.getWatchlist(userId);

    const watchlistMovieView = watchlist.map(dbWatchlistMovieToView);
    return watchlistMovieView;
  }
}
