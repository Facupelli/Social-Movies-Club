import type { Movie } from '@/infra/neon/schema';
import { TmdbRepository } from '@/infra/TMDB/tmdb-repository';
import { MoviePgRepository } from '@/movies/movie.pg.repository';
import { UserPgRepository } from './user.pg.repository';

export class UserMovieService {
  constructor(
    private readonly movies = new MoviePgRepository(),
    private readonly users = new UserPgRepository(),
    private readonly tmdb = new TmdbRepository(
      process.env.TMDB_ACCESS_TOKEN as string
    )
  ) {}

  async addMovieToUser(
    userId: string,
    tmdbId: number,
    rating: number
  ): Promise<void> {
    const { data: movie } = await this.tmdb.getDetail(tmdbId);

    const movieData: Omit<Movie, 'id'> = {
      posterPath: movie.posterPath,
      title: movie.title,
      year: movie.year,
      tmdbId: movie.id,
    };

    const { id: movieId } = await this.movies.upsertMovie(movieData);

    await this.users.rateMovie(userId, movieId, rating);
  }
}
