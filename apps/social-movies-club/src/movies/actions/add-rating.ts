"use server";

import { withAuth } from "@/lib/auth-server-action.middleware";
import { UserMovieService } from "@/users/user-movie.service";
import { validateMovieRating } from "../movie-validation.services";

export async function addRatingToMovie(
  _: { success: boolean; error?: string },
  formData: FormData
) {
  return await withAuth(async (session) => {
    const { movieTMDBId, rating } = validateMovieRating(formData);

    const userMovieService = new UserMovieService();
    await userMovieService.addMovieToUser(session.user.id, movieTMDBId, rating);

    return { success: true, error: "" };
  });
}
