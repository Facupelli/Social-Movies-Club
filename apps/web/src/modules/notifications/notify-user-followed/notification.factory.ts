import type { NewNotification } from '@/platform/database/postgres/schema';
import { NOTIFICATION_TYPE_CODES } from '../notification.constants';

export interface FollowNotificationData {
  recipientId: string;
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
    typeCode: NOTIFICATION_TYPE_CODES.USER_FOLLOW,
    actorId,
    data: {
      actorUsername,
      actorImage,
      actionUrl: `/profile/${actorId}`,
    },
  };
}
