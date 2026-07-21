import { queryOptions } from '@tanstack/react-query';
import type { UseUserMoviesMap } from '@/app/api/user/ratings/route';
import { personalizedQueryKeys } from '@/platform/react-query/personalized-query-keys';

export const ratingStatusQueryKeys = {
  map: (viewerUserId: string | undefined) =>
    personalizedQueryKeys.resource(viewerUserId, 'rating-status'),
} as const;

async function getUserRatings(signal?: AbortSignal): Promise<UseUserMoviesMap> {
  const response = await fetch('/api/user/ratings', {
    cache: 'no-store',
    signal,
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

const getUserRatingsQueryOptions = (userId: string | undefined) =>
  queryOptions({
    queryKey: ratingStatusQueryKeys.map(userId),
    queryFn: ({ signal }) => getUserRatings(signal),
    enabled: Boolean(userId),
    refetchOnWindowFocus: false,
  });

export { getUserRatingsQueryOptions, getUserRatings };
