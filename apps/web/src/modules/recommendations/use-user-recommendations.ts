import { infiniteQueryOptions } from '@tanstack/react-query';
import { personalizedQueryKeys } from '@/platform/react-query/personalized-query-keys';
import type { UserRecommendationsPage } from './recommendations.types';

export const recommendationsQueryKeys = {
  infinite: (viewerUserId: string | undefined) =>
    personalizedQueryKeys.resource(
      viewerUserId,
      'recommendations',
      'infinite'
    ),
} as const;

type LoadUserRecommendationsPage = (params: {
  cursor: string | null;
  signal?: AbortSignal;
}) => Promise<UserRecommendationsPage>;

async function getUserRecommendations({
  cursor,
  signal,
}: {
  cursor: string | null;
  signal?: AbortSignal;
}): Promise<UserRecommendationsPage> {
  const searchParams = new URLSearchParams();
  if (cursor) {
    searchParams.set('cursor', cursor);
  }

  const query = searchParams.size > 0 ? `?${searchParams.toString()}` : '';
  const response = await fetch(`/api/user/recommendations${query}`, {
    cache: 'no-store',
    signal,
  });
  if (!response.ok) {
    throw new Error('Unable to load recommendations');
  }
  return response.json();
}

const getUserRecommendationsQueryOptions = (
  userId: string | undefined,
  loadPage: LoadUserRecommendationsPage = getUserRecommendations
) =>
  infiniteQueryOptions({
    queryKey: recommendationsQueryKeys.infinite(userId),
    queryFn: ({ pageParam = null, signal }) =>
      loadPage({ cursor: pageParam, signal }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: Boolean(userId),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

export { getUserRecommendations, getUserRecommendationsQueryOptions };
