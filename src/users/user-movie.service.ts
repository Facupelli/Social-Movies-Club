// user-movie.service.ts
import type { ObjectId } from 'mongodb';
import { TmdbRepository } from '@/infra/TMDB/tmdb-repository';
import type { MovieViewModel } from '@/movies/movie.type';
import { UserRepository } from './user-repository';

export class UserMovieService {
  constructor(
    private readonly users = new UserRepository(),
    private readonly tmdb = new TmdbRepository(
      process.env.TMDB_ACCESS_TOKEN as string
    )
  ) {}

  /**
   * Fetches the movie from TMDB and stores a snapshot on the user document.
   */
  async addMovieToUser(
    userId: ObjectId,
    tmdbId: number,
    rating: number
  ): Promise<void> {
    const movie = await this.tmdb.getDetail(tmdbId);

    const movieViewModel: MovieViewModel = {
      ...movie.data,
      rating,
    };

    await this.users.addMovie(userId, movieViewModel);
  }
}
