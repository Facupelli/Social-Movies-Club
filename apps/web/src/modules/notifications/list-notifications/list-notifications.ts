import 'server-only';

import type {
  NotificationListFilters,
  PaginatedNotifications,
} from '@/modules/notifications/notification.types';
import { getNotifications } from './notifications.pg';

export interface ListNotificationsOptions {
  includeRead?: boolean;
  typeCode?: string;
  limit?: number;
  cursor?: { createdAt: Date; id: string };
}

export async function listNotifications(
  userId: string,
  options: ListNotificationsOptions = {},
  list: (
    filters: NotificationListFilters
  ) => Promise<PaginatedNotifications> = getNotifications,
  defaultPageSize = 20
): Promise<PaginatedNotifications> {
  return await list({
    recipientId: userId,
    includeRead: options.includeRead ?? false,
    typeCode: options.typeCode,
    limit: options.limit ?? defaultPageSize,
    cursor: options.cursor,
  });
}
