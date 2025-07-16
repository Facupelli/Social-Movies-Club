import { dbWatchlistMovieToView } from "@/movies/movie.adapters";
import { WatchlistPgRepository } from "./watchlist.repository";
import type { MovieView } from "@/components/movies/movie-card";

export class WatchlistService {
  constructor(
    private readonly watchlistRepository: WatchlistPgRepository = new WatchlistPgRepository()
  ) {}

  async removeMovie(userId: string, movieId: string) {
    return this.watchlistRepository.removeMovie(userId, movieId);
  }

  async getWatchlist(userId: string): Promise<MovieView[]> {
    const watchlist = await this.watchlistRepository.getWatchlist(userId);

    const watchlistMovieView = watchlist.map(dbWatchlistMovieToView);
    return watchlistMovieView;
  }
}
