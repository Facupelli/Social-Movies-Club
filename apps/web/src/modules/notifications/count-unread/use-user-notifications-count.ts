import { queryOptions } from '@tanstack/react-query';
import { personalizedQueryKeys } from '@/platform/react-query/personalized-query-keys';

export const notificationQueryKeys = {
  unreadCount: (viewerUserId: string | undefined) =>
    personalizedQueryKeys.resource(viewerUserId, 'notifications', 'unread-count'),
} as const;

async function getUserNotificationsCount(
  signal?: AbortSignal
): Promise<number> {
  const response = await fetch('/api/user/notifications/count', {
    cache: 'no-store',
    signal,
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

const getUserNotificationsCountQueryOptions = (userId: string | undefined) =>
  queryOptions({
    queryKey: notificationQueryKeys.unreadCount(userId),
    queryFn: ({ signal }) => getUserNotificationsCount(signal),
    enabled: Boolean(userId),
    refetchOnWindowFocus: false,
  });

export { getUserNotificationsCountQueryOptions };
