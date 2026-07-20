import { infiniteQueryOptions } from "@tanstack/react-query";
import type { MovieView } from "@/modules/media-catalog/movie-view";
import { QUERY_KEYS } from "@/shared/utilities/app.constants";
import type {
	UserMoviesClientFilters,
	UserMoviesServerFilters,
} from "./profile-ratings.types";
import { userMoviesFiltersUrlParser } from "./filters/filter-user-movies-parser";
import { userMoviesFiltersTransformer } from "./filters/filter-user-movies-transformer";

type UserMoviesPage = {
	nextCursor: number | null;
	data: MovieView[];
};

type LoadUserMoviesPage = (
	userId: string,
	filters: UserMoviesServerFilters,
	signal?: AbortSignal,
) => Promise<UserMoviesPage>;

async function getUserMovies(
	userId: string,
	filters: UserMoviesServerFilters,
	signal?: AbortSignal,
): Promise<UserMoviesPage> {
	const allParams = userMoviesFiltersUrlParser.toSearchParams(filters);
	allParams.set(
		"page",
		((filters.offset || 0) / (filters.limit || 20)).toString(),
	);

	const response = await fetch(
		`/api/user/${userId}/movies?${allParams.toString()}`,
		{ cache: "no-store", signal },
	);
	if (!response.ok) {
		throw new Error("Network response was not ok");
	}

	return response.json();
}

const getUserMoviesQueryOptions = (
	viewerUserId: string | undefined,
	filters: UserMoviesClientFilters & { userId: string },
	loadPage: LoadUserMoviesPage = getUserMovies,
) =>
	infiniteQueryOptions({
		queryKey: QUERY_KEYS.getUserMovies(viewerUserId, filters),
		queryFn: ({ pageParam = 0, signal }) => {
			const serverFilters = userMoviesFiltersTransformer.clientToServer(
				filters,
				{
					page: pageParam,
					limit: 20,
				},
			);

			return loadPage(filters.userId, serverFilters, signal);
		},
		initialPageParam: 0,
		enabled: Boolean(viewerUserId),
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		refetchOnWindowFocus: false,
		refetchIntervalInBackground: false,
	});

export { getUserMovies, getUserMoviesQueryOptions };
