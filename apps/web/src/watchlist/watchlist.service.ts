import { WatchlistPgRepository } from "./watchlist.repository";

export class WatchlistService {
  constructor(
    private readonly watchlistRepository: WatchlistPgRepository = new WatchlistPgRepository()
  ) {}

  async removeMovie(userId: string, movieId: string) {
    return this.watchlistRepository.removeMovie(userId, movieId);
  }

  async getWatchlist(userId: string) {
    return this.watchlistRepository.getWatchlist(userId);
  }
}
