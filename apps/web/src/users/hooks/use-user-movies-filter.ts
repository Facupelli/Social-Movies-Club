"use client";

import { useSearchParams } from "next/navigation";
import type { UserMoviesClientFilters } from "../user.types";
import { userMoviesFiltersUrlParser } from "../utils/filter-user-movies-parser";

export function useUserMoviesFilters() {
	const searchParams = useSearchParams();

	const currentFilters =
		userMoviesFiltersUrlParser.parseSearchParams(searchParams);

	const updateFilters = (newFilters: Partial<UserMoviesClientFilters>) => {
		const mergedFilters = { ...currentFilters, ...newFilters };
		const newParams = userMoviesFiltersUrlParser.toSearchParams(mergedFilters);

		const newUrl = `${window.location.pathname}?${newParams.toString()}`;
		window.history.pushState({}, "", newUrl);
	};

	return {
		filters: currentFilters,
		updateFilters,
		hasFilters: Object.keys(currentFilters).length > 0,
	};
}
