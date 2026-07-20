import { UnreadNotificationsPgRepository } from './unread-notifications.pg.repository';

export class UnreadNotificationsService {
  constructor(
    private readonly repository = new UnreadNotificationsPgRepository()
  ) {}

  async count(userId: string): Promise<number> {
    try {
      return await this.repository.count(userId);
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: preserve notification failure diagnostics
      console.error(`Failed to get unread count for user ${userId}:`, error);
      return 0;
    }
  }
}
