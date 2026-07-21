import 'server-only';

import type { UnreadNotificationCount } from '@/modules/notifications/notification.types';
import { countUnreadNotifications as countUnreadNotificationsInPostgres } from './unread-notifications.pg';

export async function countUnreadNotifications(
  userId: string,
  count: (recipientId: string) => Promise<number | string | bigint> =
    countUnreadNotificationsInPostgres
): Promise<UnreadNotificationCount> {
  const unreadCount = Number(await count(userId));

  if (!Number.isSafeInteger(unreadCount) || unreadCount < 0) {
    throw new Error('Invalid unread notification count');
  }

  return unreadCount;
}
