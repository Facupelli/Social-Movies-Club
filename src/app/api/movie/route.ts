import type { NextRequest } from 'next/server';
import type { SearchMoviesResult } from '@/infra/TMDB/tmdb-repository';
import { MovieService } from '@/movies/movie.service';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const movieService = new MovieService();

  const query = searchParams.get('q');
  if (!query) {
    return Response.json({});
  }
  const res: SearchMoviesResult = await movieService.searchMovie(query);

  return Response.json(res);
}
