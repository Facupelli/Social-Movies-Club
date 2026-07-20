import type { NextRequest } from 'next/server';
import { apiMovieToView } from '@/modules/media-catalog/get-media-details/media.adapters';
import type { MovieView } from '@/modules/media-catalog/movie-view';
import type { MultiSearchResult } from '@/platform/tmdb/tmdb.repository';
import { TmdbService } from '@/platform/tmdb/tmdb.service';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tmdbService = new TmdbService();

  const query = searchParams.get('q');
  if (!query) {
    return Response.json({});
  }

  const res: MultiSearchResult = await tmdbService.multiSearch(query);
  const movies: MovieView[] = res.data.map(apiMovieToView);

  return Response.json(movies);
}
