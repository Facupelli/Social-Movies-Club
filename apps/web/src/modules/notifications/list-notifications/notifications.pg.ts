import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import {
  NOTIFICATION_TEMPLATES,
  type NotificationTypeCode,
} from '@/modules/notifications/notification.constants';
import type {
  NotificationData,
  NotificationListFilters,
  PaginatedNotifications,
} from '@/modules/notifications/notification.types';
import { notifications } from '@/platform/database/postgres/schema';

export async function getNotifications(
  filters: NotificationListFilters
): Promise<PaginatedNotifications> {
  const {
    recipientId,
    includeRead = true,
    typeCode,
    limit = 20,
    cursor,
  } = filters;

  return await withDatabase(async (db) => {
    const conditions = [eq(notifications.recipientId, recipientId)];

    if (!includeRead) {
      conditions.push(isNull(notifications.readAt));
    }
    if (typeCode) {
      conditions.push(eq(notifications.typeCode, typeCode));
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
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt), desc(notifications.id))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = results.slice(0, limit).map((notification) => {
      const renderingData = notification.data as NotificationData;
      const template =
        NOTIFICATION_TEMPLATES[
          notification.typeCode as NotificationTypeCode
        ];

      return {
        id: notification.id,
        actorImage:
          typeof renderingData.actorImage === 'string'
            ? renderingData.actorImage
            : null,
        actorUsername:
          typeof renderingData.actorUsername === 'string'
            ? renderingData.actorUsername
            : null,
        actionUrl:
          typeof renderingData.actionUrl === 'string'
            ? renderingData.actionUrl
            : null,
        createdAt: notification.createdAt,
        readAt: notification.readAt,
        title:
          template ??
          (typeof renderingData.legacyTitle === 'string'
            ? renderingData.legacyTitle
            : notification.typeCode),
      };
    });
    const lastNotification = data.at(-1);
    const nextCursor =
      hasMore && lastNotification
        ? {
            createdAt: lastNotification.createdAt,
            id: lastNotification.id,
          }
        : undefined;

    return { data, hasMore, nextCursor };
  });
}
