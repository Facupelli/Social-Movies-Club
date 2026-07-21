import type { NewNotification } from '@/platform/database/postgres/schema';
import { NOTIFICATION_TYPE_IDS } from '../notification.constants';

export interface NotificationData {
  recipientId: string;
  actorId?: string | null;
  metadata?: Record<string, unknown>;
}

export interface FollowNotificationData extends NotificationData {
  actorId: string;
  actorUsername: string;
  actorImage: string | null;
}

export function createFollowNotification(
  data: FollowNotificationData
): NewNotification {
  const { recipientId, actorId, actorUsername, actorImage } = data;

  return {
    recipientId,
    typeId: NOTIFICATION_TYPE_IDS.USER_FOLLOW,
    actorId,
    actorUsername,
    actorImage,
    title: 'ahora te sigue',
    message: 'ahora te sigue',
    metadata: JSON.stringify({
      actionType: 'follow',
      timestamp: new Date().toISOString(),
    }),
    actionUrl: `/profile/${actorId}`,
  };
}
