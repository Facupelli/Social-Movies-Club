import { infiniteQueryOptions } from "@tanstack/react-query";
import type { MovieView } from "@/components/movies/movie-card";
import { QUERY_KEYS } from "@/lib/app.constants";
import { dbMovieToView } from "@/media/media.adapters";
import type {
	GetUserRatingMovies,
	UserMoviesClientFilters,
	UserMoviesServerFilters,
} from "../user.types";
import { userMoviesFiltersUrlParser } from "../utils/filter-user-movies-parser";
import { userMoviesFiltersTransformer } from "../utils/filter-user-movies-transformer";

async function getUserMovies(
	userId: string,
	filters: UserMoviesServerFilters,
): Promise<{ nextCursor: number | null; data: MovieView[] }> {
	const allParams = userMoviesFiltersUrlParser.toSearchParams(filters);
	allParams.set(
		"page",
		((filters.offset || 0) / (filters.limit || 20)).toString(),
	);

	const url = new URL(`/api/user/${userId}/movies`, window.location.origin);
	url.search = allParams.toString();

	const response = await fetch(url);
	if (!response.ok) {
		throw new Error("Network response was not ok");
	}

	const data: GetUserRatingMovies = await response.json();

	return {
		nextCursor: data.nextCursor,
		data: data.data.map(dbMovieToView),
	};
}

const getUserMoviesQueryOptions = (
	filters: UserMoviesClientFilters & { userId: string },
) =>
	infiniteQueryOptions({
		queryKey: QUERY_KEYS.getUserMovies(filters),
		queryFn: async ({ pageParam = 0 }) => {
			const serverFilters = userMoviesFiltersTransformer.clientToServer(
				filters,
				{
					page: pageParam,
					limit: 20,
				},
			);

			return await getUserMovies(filters.userId, serverFilters);
		},
		initialPageParam: 0,
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		refetchOnWindowFocus: false,
		refetchIntervalInBackground: false,
	});

export { getUserMovies, getUserMoviesQueryOptions };
