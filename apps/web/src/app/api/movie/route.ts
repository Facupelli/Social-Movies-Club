import type { NextRequest } from 'next/server';
import type { MovieView } from '@/components/movies/movie-card';
import type { SearchMoviesResult } from '@/infra/TMDB/tmdb-repository';
import { apiMovieToView } from '@/movies/movie.adapters';
import { MovieService } from '@/movies/movie.service';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const movieService = new MovieService();

  const query = searchParams.get('q');
  if (!query) {
    return Response.json({});
  }

  const res: SearchMoviesResult = await movieService.searchMovie(query);
  const movies: MovieView[] = res.data.map(apiMovieToView);

  return Response.json(movies);
}
