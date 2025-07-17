import { infiniteQueryOptions } from "@tanstack/react-query";
import type { MovieView } from "@/components/movies/movie-card";
import { QUERY_KEYS } from "@/lib/app.constants";
import { dbMovieToView } from "@/media/media.adapters";
import type {
	GetUserRatingMovies,
	UserMoviesSortBy,
	UserMoviesSortOrder,
	UserMoviesTypeFilter,
} from "../user.types";

interface UserMoviesFilters {
	userId: string;
	sortBy: UserMoviesSortBy | null;
	sortOrder: UserMoviesSortOrder | null;
	typeFilter: UserMoviesTypeFilter | null;
}

async function getUserMovies(
	{ userId, sortBy, sortOrder, typeFilter }: UserMoviesFilters,
	page: number,
): Promise<{ nextCursor: number | null; data: MovieView[] }> {
	const url = new URL(`/api/user/${userId}/movies`, window.location.origin);
	url.searchParams.set("page", page.toString());

	if (sortBy !== null) {
		url.searchParams.set("sortBy", sortBy);
	}
	if (sortOrder !== null) {
		url.searchParams.set("sortOrder", sortOrder);
	}
	if (typeFilter !== null) {
		url.searchParams.set("typeFilter", typeFilter);
	}

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

const getUserMoviesQueryOptions = ({
	userId,
	sortBy,
	sortOrder,
	typeFilter,
}: UserMoviesFilters) =>
	infiniteQueryOptions({
		queryKey: QUERY_KEYS.getUserMovies(userId, sortBy, sortOrder, typeFilter),
		queryFn: async ({ pageParam = 0 }) =>
			await getUserMovies({ userId, sortBy, sortOrder, typeFilter }, pageParam),
		initialPageParam: 0,
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		refetchOnWindowFocus: false,
		refetchIntervalInBackground: false,
	});

export { getUserMovies, getUserMoviesQueryOptions };
