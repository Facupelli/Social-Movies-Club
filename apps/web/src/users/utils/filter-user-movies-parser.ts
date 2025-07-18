import type { UserMoviesClientFilters } from "../user.types";
import {
	FILTER_SERACH_PARAMS_KEYS,
	userMoviesFiltersValidation,
} from "./filter-user-movies-validation";

/**
 * Parse URL search params into validated client filters
 * "URL → App State"
 */
function parseSearchParams(
	searchParams: URLSearchParams,
): UserMoviesClientFilters {
	const filters: UserMoviesClientFilters = {};

	const sortBy = searchParams.get("sortBy");
	if (sortBy && userMoviesFiltersValidation.isValidSortBy(sortBy)) {
		filters.sortBy = sortBy;
	}

	const sortOrder = searchParams.get("sortOrder");
	if (sortOrder && userMoviesFiltersValidation.isValidSortOrder(sortOrder)) {
		filters.sortOrder = sortOrder;
	}

	const typeFilter = searchParams.get("type");
	if (typeFilter && userMoviesFiltersValidation.isValidTypeFilter(typeFilter)) {
		filters.typeFilter = typeFilter;
	}

	const bothRatedFilter = searchParams.get("bothRated");
	if (
		bothRatedFilter &&
		userMoviesFiltersValidation.isValidBothRated(bothRatedFilter)
	) {
		filters.bothRated = bothRatedFilter === "true";
	}

	return filters;
}

/**
 * Parse URL object (for server-side usage)
 */
function parseUrl(url: URL): UserMoviesClientFilters {
	return parseSearchParams(url.searchParams);
}

/**
 * Convert client filters back to URL search params
 * "App State → URL"
 */
function toSearchParams(filters: UserMoviesClientFilters): URLSearchParams {
	const params = new URLSearchParams();

	if (filters.sortBy) {
		params.set(FILTER_SERACH_PARAMS_KEYS.SORT_BY, filters.sortBy);
	}
	if (filters.sortOrder) {
		params.set(FILTER_SERACH_PARAMS_KEYS.SORT_ORDER, filters.sortOrder);
	}
	if (filters.typeFilter) {
		params.set(FILTER_SERACH_PARAMS_KEYS.TYPE, filters.typeFilter);
	}
	if (filters.bothRated !== undefined) {
		params.set(
			FILTER_SERACH_PARAMS_KEYS.BOTH_RATED,
			filters.bothRated.toString(),
		);
	}

	return params;
}

export const userMoviesFiltersUrlParser = {
	parseSearchParams,
	parseUrl,
	toSearchParams,
};
