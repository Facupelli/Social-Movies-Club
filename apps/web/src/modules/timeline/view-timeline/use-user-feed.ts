import { infiniteQueryOptions } from '@tanstack/react-query';
import { personalizedQueryKeys } from '@/platform/react-query/personalized-query-keys';
import type { UserFeedPage } from './feed.types';

export const timelineQueryKeys = {
  chronological: (viewerUserId: string | undefined) =>
    personalizedQueryKeys.resource(
      viewerUserId,
      'timeline',
      'chronological',
      'infinite'
    ),
} as const;

type LoadUserFeedPage = (params: {
  cursor: string | null;
  signal?: AbortSignal;
}) => Promise<UserFeedPage>;

async function getUserFeed({
  cursor,
  signal,
}: {
  cursor: string | null;
  signal?: AbortSignal;
}): Promise<UserFeedPage> {
  const searchParams = new URLSearchParams();
  if (cursor) {
    searchParams.set('cursor', cursor);
  }

  const query = searchParams.size > 0 ? `?${searchParams.toString()}` : '';
  const response = await fetch(`/api/user/feed${query}`, {
    cache: 'no-store',
    signal,
  });
  if (!response.ok) {
    throw new Error('Unable to load the timeline feed');
  }
  return response.json();
}

const getUserFeedQueryOptions = (
  userId: string | undefined,
  loadPage: LoadUserFeedPage = getUserFeed
) =>
  infiniteQueryOptions({
    queryKey: timelineQueryKeys.chronological(userId),
    queryFn: ({ pageParam = null, signal }) =>
      loadPage({ cursor: pageParam, signal }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: Boolean(userId),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

export { getUserFeedQueryOptions, getUserFeed };
