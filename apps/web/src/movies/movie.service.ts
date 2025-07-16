import { MoviePgRepository } from "./movie.pg.repository";

export class MovieService {
  constructor(
    private readonly repo: MoviePgRepository = new MoviePgRepository()
  ) {}

  async getMovieByTMDBId(tmdbId: number): Promise<{ id: string }> {
    return await this.repo.getMovieByTMDBId(tmdbId);
  }
}
