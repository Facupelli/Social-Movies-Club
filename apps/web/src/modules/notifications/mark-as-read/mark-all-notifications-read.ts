'use server';

import { getServerSession } from '@/platform/auth/get-server-session';
import { execute } from '@/shared/http/safe-execute';
import { markAllNotificationsReadForViewer } from './mark-all-notifications-read.service';

export type MarkAllNotificationsReadResult =
  | { success: true; unreadCount: number }
  | { success: false; error: string };

export async function markAllNotificationsRead(): Promise<MarkAllNotificationsReadResult> {
  const session = await getServerSession();
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  const result = await execute(
    () => markAllNotificationsReadForViewer(session.user.id),
    () => ({ success: false, error: 'Unable to mark notifications as read' })
  );

  if (!result.success) {
    return result;
  }

  return { success: true, unreadCount: result.data };
}
