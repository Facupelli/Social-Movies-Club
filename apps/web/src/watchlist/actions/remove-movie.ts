"use server";

import { withAuth } from "@/lib/auth-server-action.middleware";
import { WatchlistService } from "../watchlist.service";
import { validateRemoveMovieFromWatchlist } from "../watchlist-validation.service";
import { MovieService } from "@/movies/movie.service";
import { revalidateTag } from "next/cache";
import { NEXT_CACHE_TAGS } from "@/lib/app.constants";

export async function removeMovieFromWatchlist(
  _: { success: boolean; error?: string },
  formData: FormData
) {
  return await withAuth(async (session) => {
    const { movieTMDBId, userId } = validateRemoveMovieFromWatchlist(formData);

    if (userId !== session.user.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const movieService = new MovieService();
    const watchlistService = new WatchlistService();

    const movie = await movieService.getMovieByTMDBId(movieTMDBId);
    await watchlistService.removeMovie(userId, movie.id);

    revalidateTag(NEXT_CACHE_TAGS.getUserWatchlist(userId));

    return { success: true, error: "" };
  });
}
