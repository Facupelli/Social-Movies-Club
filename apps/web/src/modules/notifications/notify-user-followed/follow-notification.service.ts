import type { NewNotification } from '@/platform/database/postgres/schema';
import { FollowNotificationPgRepository } from './follow-notification.pg.repository';

export class FollowNotificationService {
  constructor(
    private readonly repository = new FollowNotificationPgRepository()
  ) {}

  async create(notification: NewNotification): Promise<boolean> {
    try {
      await this.repository.create(notification);
      return true;
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: preserve notification failure diagnostics
      console.error('Failed to create notification:', error);
      return false;
    }
  }
}
