import {
  getNotifications,
  type NotificationFilters,
  type PaginatedNotifications,
} from './notifications.pg';

export interface ListNotificationsOptions {
  includeRead?: boolean;
  typeId?: string;
  limit?: number;
  cursor?: { createdAt: Date; id: string };
}

export async function listNotifications(
  userId: string,
  options: ListNotificationsOptions = {},
  list: (filters: NotificationFilters) => Promise<PaginatedNotifications> =
    getNotifications,
  defaultPageSize = 20
): Promise<PaginatedNotifications> {
  return await list({
    recipientId: userId,
    includeRead: options.includeRead ?? false,
    typeId: options.typeId,
    limit: options.limit ?? defaultPageSize,
    cursor: options.cursor,
  });
}
