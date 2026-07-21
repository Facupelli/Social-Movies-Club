'use client';

import { infiniteQueryOptions } from '@tanstack/react-query';
import { personalizedQueryKeys } from '@/platform/react-query/personalized-query-keys';
import type { AggregatedFeedItem } from './feed.types';

export const aggregatedTimelineQueryKeys = {
  infinite: (viewerUserId: string | undefined) =>
    personalizedQueryKeys.resource(viewerUserId, 'timeline', 'aggregated', 'infinite'),
} as const;

async function getUserFeed({
  cursor,
  signal,
}: {
  cursor: string | null;
  signal?: AbortSignal;
}): Promise<{ items: AggregatedFeedItem[]; nextCursor: string | null }> {
  const url = new URL('/api/user/feed/aggregated', window.location.origin);
  if (cursor) {
    url.searchParams.set('cursor', cursor);
  }

  const response = await fetch(url, { cache: 'no-store', signal });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

const getUserAggregatedFeedQueryOptions = (userId: string | undefined) =>
  infiniteQueryOptions({
    queryKey: aggregatedTimelineQueryKeys.infinite(userId),
    queryFn: async ({ pageParam = null, signal }) =>
      await getUserFeed({ cursor: pageParam, signal }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: Boolean(userId),
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  });

export { getUserAggregatedFeedQueryOptions };
