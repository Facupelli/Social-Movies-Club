import 'server-only';

import { countUnreadNotifications } from '@/modules/notifications/count-unread/count-unread-notifications';
import { markNotificationsRead } from './mark-notifications-read.pg';

export async function markAllNotificationsReadForViewer(
  viewerUserId: string,
  markRead: (recipientId: string) => Promise<number> = markNotificationsRead,
  countUnread: (recipientId: string) => Promise<number> =
    countUnreadNotifications
): Promise<number> {
  await markRead(viewerUserId);

  // Count after the set-based update so notifications committed concurrently
  // before this read are reflected in the authoritative result.
  return await countUnread(viewerUserId);
}
