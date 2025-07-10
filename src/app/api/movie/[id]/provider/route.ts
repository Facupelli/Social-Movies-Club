import type { WatchProviderResult } from '@/infra/TMDB/types/watch-provider';
import { MovieService } from '@/movies/movie.service';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const movieService = new MovieService();

  const res: { data: WatchProviderResult } =
    await movieService.getWatchProvider(Number(id));
  return Response.json(res);
}
