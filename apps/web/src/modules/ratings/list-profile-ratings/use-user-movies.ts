import { infiniteQueryOptions } from '@tanstack/react-query';
import {
  serializeProfileRatingsFilters,
  toProfileRatingsRepositoryFilters,
} from './filters/filter-user-movies-parser';
import type {
  ProfileRatingsFilters,
  ProfileRatingsPage,
  ProfileRatingsRepositoryFilters,
} from './profile-ratings.types';

export const PROFILE_RATINGS_PAGE_SIZE = 20;
export const PROFILE_RATINGS_INITIAL_PAGE = 0;
export const PROFILE_RATINGS_STALE_TIME = 45_000;

export const profileRatingsQueryKeys = {
  viewerScope: (viewerUserId: string | undefined) =>
    ['viewer', viewerUserId, 'profile-ratings'] as const,
  profileScope: (viewerUserId: string | undefined, profileUserId: string) =>
    [
      ...profileRatingsQueryKeys.viewerScope(viewerUserId),
      profileUserId,
    ] as const,
  infinite: (
    viewerUserId: string | undefined,
    profileUserId: string,
    filters: ProfileRatingsFilters
  ) =>
    [
      ...profileRatingsQueryKeys.profileScope(viewerUserId, profileUserId),
      'infinite',
      filters,
    ] as const,
} as const;

type LoadProfileRatingsPage = (
  profileUserId: string,
  filters: ProfileRatingsRepositoryFilters,
  signal?: AbortSignal
) => Promise<ProfileRatingsPage>;

export async function fetchProfileRatingsPage(
  profileUserId: string,
  filters: ProfileRatingsRepositoryFilters,
  signal?: AbortSignal
): Promise<ProfileRatingsPage> {
  const params = serializeProfileRatingsFilters(filters);
  params.set('page', String(filters.offset / filters.limit));

  const response = await fetch(
    `/api/user/${encodeURIComponent(profileUserId)}/movies?${params.toString()}`,
    { cache: 'no-store', signal }
  );
  if (!response.ok) {
    throw new Error('Unable to load profile ratings');
  }
  return response.json();
}

export function getProfileRatingsQueryOptions(
  viewerUserId: string | undefined,
  profileUserId: string,
  filters: ProfileRatingsFilters,
  loadPage: LoadProfileRatingsPage = fetchProfileRatingsPage
) {
  return infiniteQueryOptions({
    queryKey: profileRatingsQueryKeys.infinite(
      viewerUserId,
      profileUserId,
      filters
    ),
    queryFn: ({ pageParam, signal }) =>
      loadPage(
        profileUserId,
        toProfileRatingsRepositoryFilters(
          filters,
          pageParam,
          PROFILE_RATINGS_PAGE_SIZE
        ),
        signal
      ),
    initialPageParam: PROFILE_RATINGS_INITIAL_PAGE,
    enabled: Boolean(viewerUserId),
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    staleTime: PROFILE_RATINGS_STALE_TIME,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
