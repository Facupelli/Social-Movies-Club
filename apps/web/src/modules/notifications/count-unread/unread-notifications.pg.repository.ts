import { and, count, eq, isNull } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import { notifications } from '@/platform/database/postgres/schema';

export class UnreadNotificationsPgRepository {
  async count(recipientId: string): Promise<number> {
    return await withDatabase(async (db) => {
      const result = await db
        .select({ count: count() })
        .from(notifications)
        .where(
          and(
            eq(notifications.recipientId, recipientId),
            eq(notifications.isDeleted, false),
            isNull(notifications.readAt)
          )
        );

      return result[0]?.count ?? 0;
    });
  }
}
