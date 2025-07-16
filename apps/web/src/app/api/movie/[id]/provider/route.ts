import { TmdbService } from "@/infra/TMDB/tmdb.service";
import type { WatchProviderResult } from "@/infra/TMDB/types/watch-provider";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tmdbService = new TmdbService();

  const res: { data: WatchProviderResult } = await tmdbService.getWatchProvider(
    Number(id)
  );
  return Response.json(res);
}
