import { withDatabase } from '@/platform/database/postgres/db-utils';
import {
  type NewNotification,
  notifications,
} from '@/platform/database/postgres/schema';

export class FollowNotificationPgRepository {
  async create(notification: NewNotification): Promise<void> {
    await withDatabase(async (db) => {
      await db.insert(notifications).values(notification);
    });
  }
}
