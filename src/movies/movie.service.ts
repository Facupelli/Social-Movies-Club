import {
  type SearchMoviesResult,
  TmdbRepository,
} from '@/infra/TMDB/tmdb-repository';
import type { WatchProviderResult } from '@/infra/TMDB/types/watch-provider';

export class MovieService {
  constructor(
    private readonly repo: TmdbRepository = new TmdbRepository(
      process.env.TMDB_ACCESS_TOKEN as string
    )
  ) {}

  async searchMovie(query: string): Promise<SearchMoviesResult> {
    return await this.repo.searchMovies({
      query,
    });
  }

  async getWatchProvider(
    movieId: number
  ): Promise<{ data: WatchProviderResult }> {
    return await this.repo.getWatchProviders(movieId);
  }
}
