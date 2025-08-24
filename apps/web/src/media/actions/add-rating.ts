"use server";

import { withAuth } from "@/lib/auth/auth-server-action.middleware";
import { type ApiResponse, execute } from "@/lib/safe-execute";
import { UserMediaService } from "@/users/user-movie.service";
import { validateMovieRating } from "../media-validation.services";

export async function addRatingToMovie(
	formData: FormData,
): Promise<ApiResponse<void>> {
	return await withAuth(async (session) => {
		const { movieTMDBId, rating, type } = validateMovieRating(formData);

		const userMediaService = new UserMediaService();

		return await execute<void>(async () => {
			return await userMediaService.rateMovie({
				userId: session.user.id,
				tmdbId: movieTMDBId,
				rating,
				type,
			});
		});
	});
}
