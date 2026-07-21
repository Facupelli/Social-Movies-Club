import type { NextRequest } from 'next/server';
import { apiMovieToView } from '@/modules/media-catalog/get-media-details/media.adapters';
import { TmdbService } from '@/platform/tmdb/tmdb.service';

const MIN_QUERY_LENGTH = 3;
const MAX_QUERY_LENGTH = 200;

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (query.length < MIN_QUERY_LENGTH) {
    return Response.json([]);
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return Response.json({ error: 'Search query is too long' }, { status: 400 });
  }

  try {
    const result = await new TmdbService().multiSearch(query);
    return Response.json(result.data.map(apiMovieToView));
  } catch {
    return Response.json({ error: 'Unable to search media' }, { status: 502 });
  }
}
