import type {
	UserMoviesBothRatedFilter,
	UserMoviesSortBy,
	UserMoviesSortOrder,
	UserMoviesTypeFilter,
} from "../user.types";

const VALID_SORT_BY: UserMoviesSortBy[] = ["score", "createdAt"];
const VALID_SORT_ORDER: UserMoviesSortOrder[] = ["asc", "desc"];
const VALID_TYPE_FILTER: UserMoviesTypeFilter[] = ["all", "movie", "tv"];

export const FILTER_SERACH_PARAMS_KEYS = {
	SORT_BY: "sortBy",
	SORT_ORDER: "sortOrder",
	TYPE: "type",
	BOTH_RATED: "bothRated",
} as const;

const isValidSortBy = (value: string): value is UserMoviesSortBy =>
	VALID_SORT_BY.includes(value as UserMoviesSortBy);

const isValidSortOrder = (value: string): value is UserMoviesSortOrder =>
	VALID_SORT_ORDER.includes(value as UserMoviesSortOrder);

const isValidTypeFilter = (value: string): value is UserMoviesTypeFilter =>
	VALID_TYPE_FILTER.includes(value as UserMoviesTypeFilter);

const isValidBothRated = (value: string): value is UserMoviesBothRatedFilter =>
	value === "true" || value === "false";

export const userMoviesFiltersValidation = {
	isValidSortBy,
	isValidSortOrder,
	isValidTypeFilter,
	isValidBothRated,
};
