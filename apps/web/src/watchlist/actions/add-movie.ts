"use server";

import { withAuth } from "@/lib/auth-server-action.middleware";
import { UserMovieService } from "@/users/user-movie.service";
import { validateAddMovieToWatchlist } from "../watchlist-validation.service";

export async function addMovieToWatchlist(formData: FormData) {
  return await withAuth(async (session) => {
    const { movieTMDBId, userId } = validateAddMovieToWatchlist(formData);

    if (userId !== session.user.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const userMovieService = new UserMovieService();
    await userMovieService.addMovieToWatchlist(userId, movieTMDBId);

    return { success: true, error: "" };
  });
}
