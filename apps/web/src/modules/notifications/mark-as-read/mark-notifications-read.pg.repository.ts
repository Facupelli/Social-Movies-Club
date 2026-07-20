import { and, eq, isNull } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import { notifications } from '@/platform/database/postgres/schema';

export class MarkNotificationsReadPgRepository {
  async markAll(recipientId: string): Promise<number> {
    return await withDatabase(async (db) => {
      const updated = await db
        .update(notifications)
        .set({
          readAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(notifications.recipientId, recipientId),
            isNull(notifications.readAt),
            eq(notifications.isDeleted, false)
          )
        )
        .returning({ id: notifications.id });

      return updated.length;
    });
  }
}
