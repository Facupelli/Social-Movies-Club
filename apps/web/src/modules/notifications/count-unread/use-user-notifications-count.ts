import { queryOptions } from '@tanstack/react-query';
import type { UnreadNotificationCount } from '@/modules/notifications/notification.types';
import { personalizedQueryKeys } from '@/platform/react-query/personalized-query-keys';

export const notificationQueryKeys = {
  unreadCount: (viewerUserId: string | undefined) =>
    personalizedQueryKeys.resource(viewerUserId, 'notifications', 'unread-count'),
} as const;

export async function fetchUnreadNotificationCount(
  signal?: AbortSignal
): Promise<UnreadNotificationCount> {
  const response = await fetch('/api/user/notifications/count', {
    cache: 'no-store',
    signal,
  });

  if (!response.ok) {
    throw new Error('Unable to load unread notifications');
  }

  const count: unknown = await response.json();
  if (typeof count !== 'number' || !Number.isSafeInteger(count) || count < 0) {
    throw new Error('Invalid unread notification count');
  }

  return count;
}

export const getUserNotificationsCountQueryOptions = (
  viewerUserId: string | undefined
) =>
  queryOptions({
    queryKey: notificationQueryKeys.unreadCount(viewerUserId),
    queryFn: ({ signal }) => fetchUnreadNotificationCount(signal),
    enabled: viewerUserId !== undefined,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
