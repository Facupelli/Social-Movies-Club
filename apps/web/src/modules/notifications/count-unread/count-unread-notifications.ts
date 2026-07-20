import { countUnreadNotifications as countUnreadNotificationsInPostgres } from './unread-notifications.pg';

export async function countUnreadNotifications(
  userId: string,
  count: typeof countUnreadNotificationsInPostgres =
    countUnreadNotificationsInPostgres
): Promise<number> {
  try {
    return await count(userId);
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: preserve notification failure diagnostics
    console.error(`Failed to get unread count for user ${userId}:`, error);
    return 0;
  }
}
