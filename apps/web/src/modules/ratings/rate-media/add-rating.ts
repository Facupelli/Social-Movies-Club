"use server";

import { withAuth } from "@/platform/auth/auth-server-action.middleware";
import { type ApiResponse, execute } from "@/shared/http/safe-execute";
import { UserMediaService } from "@/modules/ratings/rate-media/user-movie.service";
import { validateMovieRating } from "./rating-validation";

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
