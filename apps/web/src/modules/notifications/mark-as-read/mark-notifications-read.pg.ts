import { and, eq, isNull } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import { notifications } from '@/platform/database/postgres/schema';

export async function markNotificationsRead(
  recipientId: string
): Promise<number> {
  return await withDatabase(async (db) => {
    const updated = await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(notifications.recipientId, recipientId),
          isNull(notifications.readAt)
        )
      )
      .returning({ id: notifications.id });

    return updated.length;
  });
}
