import { TmdbService } from "@/infra/TMDB/tmdb.service";
import type { WatchProviderResult } from "@/infra/TMDB/types/watch-provider";
import type { MediaType } from "@/media/media.type";

export async function GET(
	request: Request,
	{
		params,
	}: {
		params: Promise<{ id: string }>;
	},
) {
	const { id } = await params;
	const url = new URL(request.url);
	const type = url.searchParams.get("type") as MediaType;

	const tmdbService = new TmdbService();

	const res: { data: WatchProviderResult } = await tmdbService.getWatchProvider(
		Number(id),
		type,
	);
	return Response.json(res);
}
