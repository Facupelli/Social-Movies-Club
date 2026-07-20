'use client';

import { useSearchParams } from 'next/navigation';
import { userMoviesFiltersUrlParser } from './filters/filter-user-movies-parser';
import type { UserMoviesClientFilters } from './profile-ratings.types';

export function useUserMoviesFilters() {
  const searchParams = useSearchParams();

  const currentFilters =
    userMoviesFiltersUrlParser.parseSearchParams(searchParams);

  const updateFilters = (newFilters: Partial<UserMoviesClientFilters>) => {
    const mergedFilters = { ...currentFilters, ...newFilters };
    const newParams = userMoviesFiltersUrlParser.toSearchParams(mergedFilters);

    const newUrl = `${window.location.pathname}?${newParams.toString()}`;
    window.history.pushState({}, '', newUrl);
  };

  return {
    filters: currentFilters,
    updateFilters,
    hasFilters: Object.keys(currentFilters).length > 0,
  };
}
