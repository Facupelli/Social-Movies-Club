import type {
	UserMoviesClientFilters,
	UserMoviesServerFilters,
} from "../user.types";

/**
 * Transform client filters to server filters
 */
function clientToServer(
	clientFilters: UserMoviesClientFilters,
	pagination: { page: number; limit: number },
): UserMoviesServerFilters {
	const serverFilters: UserMoviesServerFilters = {
		...clientFilters,
		limit: pagination.limit,
		offset: pagination.page * pagination.limit,
	};

	return serverFilters;
}

export const userMoviesFiltersTransformer = {
	clientToServer,
};
