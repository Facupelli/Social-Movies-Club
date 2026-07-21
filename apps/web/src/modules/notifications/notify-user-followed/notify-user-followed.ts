import 'server-only';

import { createFollowNotification as createFollowNotificationRecord } from './follow-notification.pg';
import { createFollowNotification } from './notification.factory';

export interface UserFollowedEvent {
  followerId: string;
  followedUserId: string;
  followerUsername: string;
  followerImage: string | null;
  timestamp: Date;
}

export async function notifyUserFollowed(
  event: UserFollowedEvent,
  create: typeof createFollowNotificationRecord = createFollowNotificationRecord
): Promise<boolean> {
  const { followerId, followedUserId, followerUsername, followerImage } = event;

  if (followerId === followedUserId) {
    return false;
  }

  const notification = createFollowNotification({
    recipientId: followedUserId,
    actorId: followerId,
    actorUsername: followerUsername,
    actorImage: followerImage,
  });

  try {
    await create(notification);
    return true;
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: preserve notification failure diagnostics
    console.error('Failed to create notification:', error);
    return false;
  }
}
