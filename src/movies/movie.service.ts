import {
  type SearchMoviesResult,
  TmdbRepository,
} from '@/infra/TMDB/tmdb-repository';

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
}
