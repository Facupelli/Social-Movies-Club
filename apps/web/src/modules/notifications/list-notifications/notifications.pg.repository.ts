import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import {
  type Notification,
  type NotificationType,
  notifications,
  notificationTypes,
} from '@/platform/database/postgres/schema';

export type NotificationCursor = {
  createdAt: Date;
  id: string;
};

export interface NotificationFilters {
  recipientId: string;
  includeRead?: boolean;
  typeId?: string;
  limit?: number;
  cursor?: NotificationCursor;
}

export interface PaginatedNotifications {
  data: Array<Notification & { type: NotificationType }>;
  hasMore: boolean;
  nextCursor?: NotificationCursor;
}

export class NotificationsPgRepository {
  async getNotifications(
    filters: NotificationFilters
  ): Promise<PaginatedNotifications> {
    const {
      recipientId,
      includeRead = true,
      typeId,
      limit = 20,
      cursor,
    } = filters;

    return await withDatabase(async (db) => {
      const conditions = [
        eq(notifications.recipientId, recipientId),
        eq(notifications.isDeleted, false),
      ];

      if (!includeRead) {
        conditions.push(isNull(notifications.readAt));
      }

      if (typeId) {
        conditions.push(eq(notifications.typeId, typeId));
      }

      if (cursor) {
        conditions.push(sql`
          ${notifications.createdAt} < ${cursor.createdAt}
          OR (
            ${notifications.createdAt} = ${cursor.createdAt}
            AND ${notifications.id} < ${cursor.id}
          )
        `);
      }

      const results = await db
        .select({
          notification: notifications,
          type: notificationTypes,
        })
        .from(notifications)
        .innerJoin(
          notificationTypes,
          eq(notifications.typeId, notificationTypes.id)
        )
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt), desc(notifications.id))
        .limit(limit + 1);

      const hasMore = results.length > limit;
      const data = results.slice(0, limit).map((row) => ({
        ...row.notification,
        type: row.type,
      }));

      const lastNotification = data.at(-1);
      const nextCursor =
        hasMore && lastNotification
          ? {
              createdAt: lastNotification.createdAt,
              id: lastNotification.id,
            }
          : undefined;

      return {
        data,
        hasMore,
        nextCursor,
      };
    });
  }
}
