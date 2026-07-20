import type { QueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/utilities/app.constants";

type UserRatingsCache = Record<
	number,
	{
		isRated: boolean;
		score: number;
	}
>;

export async function invalidateAfterRating(
	queryClient: QueryClient,
	userId: string,
): Promise<void> {
	await Promise.all([
		queryClient.invalidateQueries({
			queryKey: QUERY_KEYS.getUserRatings(userId),
		}),
		queryClient.invalidateQueries({
			queryKey: QUERY_KEYS.getUserMoviesScope(userId),
		}),
	]);
}

export async function optimisticallyRateMedia(
	queryClient: QueryClient,
	{
		userId,
		tmdbId,
		score,
	}: {
		userId: string;
		tmdbId: number;
		score: number;
	},
): Promise<() => void> {
	const ratingsKey = QUERY_KEYS.getUserRatings(userId);

	await queryClient.cancelQueries({ queryKey: ratingsKey });

	const ratings = queryClient.getQueryData<UserRatingsCache>(ratingsKey);
	const previousRating = ratings?.[tmdbId];

	if (ratings) {
		queryClient.setQueryData<UserRatingsCache>(ratingsKey, {
			...ratings,
			[tmdbId]: { isRated: true, score },
		});
	}

	return () => {
		if (ratings) {
			queryClient.setQueryData<UserRatingsCache>(ratingsKey, (current) => {
				const nextRatings = { ...current };
				if (previousRating) {
					nextRatings[tmdbId] = previousRating;
				} else {
					delete nextRatings[tmdbId];
				}
				return nextRatings;
			});
		}
	};
}
