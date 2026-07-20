'use server';

import { MarkNotificationsReadService } from './mark-notifications-read.service';
import { withAuth } from '@/platform/auth/auth-server-action.middleware';

export async function markNotiAsRead() {
  return await withAuth(async (session) => {
    try {
      const notificationService = new MarkNotificationsReadService();
      await notificationService.markAll(session.user.id);

      return { success: true };
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: preserve server action failure diagnostics
      console.log('Server-Action [MARK NOTI AS READ] Error:', error);
      return { success: false };
    }
  });
}
