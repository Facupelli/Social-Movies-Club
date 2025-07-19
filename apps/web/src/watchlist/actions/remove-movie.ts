"use server";

import { revalidateTag } from "next/cache";
import { NEXT_CACHE_TAGS } from "@/lib/app.constants";
import { withAuth } from "@/lib/auth/auth-server-action.middleware";
import { type ApiResponse, execute } from "@/lib/safe-execute";
import { MediaService } from "@/media/media.service";
import { WatchlistService } from "../watchlist.service";
import { validateRemoveMovieFromWatchlist } from "../watchlist-validation.service";

export async function removeMovieFromWatchlist(
	_: ApiResponse<void>,
	formData: FormData,
): Promise<ApiResponse<void>> {
	return await withAuth(async (session) => {
		const { movieTMDBId, userId } = validateRemoveMovieFromWatchlist(formData);

		if (userId !== session.user.id) {
			return {
				success: false,
				error: "Unauthorized",
			};
		}

		const mediaService = new MediaService();
		const watchlistService = new WatchlistService();

		const result = await execute<void>(async () => {
			const movie = await mediaService.getMediaByTMDBId(movieTMDBId);
			await watchlistService.removeMedia(userId, movie.id);
		});

		if (result.success) {
			revalidateTag(NEXT_CACHE_TAGS.getUserWatchlist(userId));
		}

		return result;
	});
}
