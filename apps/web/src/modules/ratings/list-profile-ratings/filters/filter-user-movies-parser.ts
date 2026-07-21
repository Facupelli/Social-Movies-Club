import type {
  ProfileRatingsFilters,
  ProfileRatingsRepositoryFilters,
  ProfileRatingsSortBy,
  ProfileRatingsSortOrder,
  ProfileRatingsTypeFilter,
} from '../profile-ratings.types';

export const PROFILE_RATINGS_SEARCH_PARAMS = {
  sortBy: 'sortBy',
  sortOrder: 'sortOrder',
  typeFilter: 'type',
  bothRated: 'bothRated',
} as const;

export const DEFAULT_PROFILE_RATINGS_FILTERS: ProfileRatingsFilters = {
  sortBy: 'createdAt',
  sortOrder: 'desc',
  typeFilter: 'all',
  bothRated: false,
};

const SORT_FIELDS: readonly ProfileRatingsSortBy[] = ['score', 'createdAt'];
const SORT_ORDERS: readonly ProfileRatingsSortOrder[] = ['asc', 'desc'];
const MEDIA_TYPES: readonly ProfileRatingsTypeFilter[] = ['all', 'movie', 'tv'];

function parseBothRated(value: string | null): boolean {
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  return DEFAULT_PROFILE_RATINGS_FILTERS.bothRated;
}

export function parseProfileRatingsFilters(
  params: Pick<URLSearchParams, 'get'>
): ProfileRatingsFilters {
  const sortBy = params.get(PROFILE_RATINGS_SEARCH_PARAMS.sortBy);
  const sortOrder = params.get(PROFILE_RATINGS_SEARCH_PARAMS.sortOrder);
  const typeFilter = params.get(PROFILE_RATINGS_SEARCH_PARAMS.typeFilter);
  const bothRated = params.get(PROFILE_RATINGS_SEARCH_PARAMS.bothRated);

  return {
    sortBy: SORT_FIELDS.includes(sortBy as ProfileRatingsSortBy)
      ? (sortBy as ProfileRatingsSortBy)
      : DEFAULT_PROFILE_RATINGS_FILTERS.sortBy,
    sortOrder: SORT_ORDERS.includes(sortOrder as ProfileRatingsSortOrder)
      ? (sortOrder as ProfileRatingsSortOrder)
      : DEFAULT_PROFILE_RATINGS_FILTERS.sortOrder,
    typeFilter: MEDIA_TYPES.includes(typeFilter as ProfileRatingsTypeFilter)
      ? (typeFilter as ProfileRatingsTypeFilter)
      : DEFAULT_PROFILE_RATINGS_FILTERS.typeFilter,
    bothRated: parseBothRated(bothRated),
  };
}

/** Serializes filters canonically while preserving unrelated parameters. */
export function serializeProfileRatingsFilters(
  filters: ProfileRatingsFilters,
  current: URLSearchParams = new URLSearchParams()
): URLSearchParams {
  const params = new URLSearchParams(current.toString());

  for (const key of Object.values(PROFILE_RATINGS_SEARCH_PARAMS)) {
    params.delete(key);
  }

  if (filters.sortBy !== DEFAULT_PROFILE_RATINGS_FILTERS.sortBy) {
    params.set(PROFILE_RATINGS_SEARCH_PARAMS.sortBy, filters.sortBy);
  }
  if (filters.sortOrder !== DEFAULT_PROFILE_RATINGS_FILTERS.sortOrder) {
    params.set(PROFILE_RATINGS_SEARCH_PARAMS.sortOrder, filters.sortOrder);
  }
  if (filters.typeFilter !== DEFAULT_PROFILE_RATINGS_FILTERS.typeFilter) {
    params.set(PROFILE_RATINGS_SEARCH_PARAMS.typeFilter, filters.typeFilter);
  }
  if (filters.bothRated !== DEFAULT_PROFILE_RATINGS_FILTERS.bothRated) {
    params.set(
      PROFILE_RATINGS_SEARCH_PARAMS.bothRated,
      String(filters.bothRated)
    );
  }

  return params;
}

export function toProfileRatingsRepositoryFilters(
  filters: ProfileRatingsFilters,
  page: number,
  limit: number
): ProfileRatingsRepositoryFilters {
  return { ...filters, limit, offset: page * limit };
}
