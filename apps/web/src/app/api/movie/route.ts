import type { NextRequest } from "next/server";
import type { MovieView } from "@/components/movies/movie-card";
import type { SearchMoviesResult } from "@/infra/TMDB/tmdb.repository";
import { apiMovieToView } from "@/movies/movie.adapters";
import { TmdbService } from "@/infra/TMDB/tmdb.service";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tmdbService = new TmdbService();

  const query = searchParams.get("q");
  if (!query) {
    return Response.json({});
  }

  const res: SearchMoviesResult = await tmdbService.searchMovie(query);
  const movies: MovieView[] = res.data.map(apiMovieToView);

  return Response.json(movies);
}
