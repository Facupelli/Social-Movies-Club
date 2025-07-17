import type { NextRequest } from "next/server";
import type { MovieView } from "@/components/movies/movie-card";
import type { MultiSearchResult } from "@/infra/TMDB/tmdb.repository";
import { TmdbService } from "@/infra/TMDB/tmdb.service";
import { apiMovieToView } from "@/media/media.adapters";

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const tmdbService = new TmdbService();

	const query = searchParams.get("q");
	if (!query) {
		return Response.json({});
	}

	const res: MultiSearchResult = await tmdbService.multiSearch(query);
	const movies: MovieView[] = res.data.map(apiMovieToView);

	return Response.json(movies);
}
