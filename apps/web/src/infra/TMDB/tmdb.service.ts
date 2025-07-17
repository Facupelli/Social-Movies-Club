import {
  type MultiSearchResult,
  type SearchMoviesResult,
  TmdbRepository,
} from '@/infra/TMDB/tmdb.repository';
import type { WatchProviderResult } from '@/infra/TMDB/types/watch-provider';
import type { TMDbMediaMultiSearch } from '@/movies/movie.type';

export class TmdbService {
  constructor(
    private readonly repo: TmdbRepository = new TmdbRepository(
      process.env.TMDB_ACCESS_TOKEN as string
    )
  ) {}

  async multiSearch(query: string): Promise<MultiSearchResult> {
    return await this.repo.multiSearch({
      query,
    });
  }

  async searchMovie(query: string): Promise<SearchMoviesResult> {
    return await this.repo.searchMovies({
      query,
    });
  }

  async getMovieDetail(
    movieId: number
  ): Promise<{ data: TMDbMediaMultiSearch }> {
    return await this.repo.getMovieDetail(movieId);
  }

  async getTvDetail(movieId: number): Promise<{ data: TMDbMediaMultiSearch }> {
    return await this.repo.getTvDetail(movieId);
  }

  async getWatchProvider(
    movieId: number
  ): Promise<{ data: WatchProviderResult }> {
    return await this.repo.getWatchProviders(movieId);
  }
}
