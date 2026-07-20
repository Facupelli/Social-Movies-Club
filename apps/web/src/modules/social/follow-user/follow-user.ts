import { FollowNotificationService } from '@/modules/notifications/notify-user-followed/follow-notification.service';
import {
  NotificationEventRegistry,
  type UserFollowedEvent,
} from '@/modules/notifications/notify-user-followed/notification-event-handler';
import { ProfileService } from '@/modules/profiles/profile.service';
import { createFollow, removeFollow } from './follow-user.pg';

const notificationService = new FollowNotificationService();
const eventRegistry = new NotificationEventRegistry(notificationService);
const profileService = new ProfileService();

type FollowUserDependencies = {
  createFollow: typeof createFollow;
  getUser: ProfileService['getUser'];
  notifyUserFollowed: (event: UserFollowedEvent) => Promise<boolean>;
};

const followUserDependencies: FollowUserDependencies = {
  createFollow,
  getUser: (userId) => profileService.getUser(userId),
  notifyUserFollowed: (event) =>
    eventRegistry.handleEvent('user_followed', event),
};

export async function followUser(
  userId: string,
  followedUserId: string,
  dependencies: FollowUserDependencies = followUserDependencies
): Promise<void> {
  if (userId === followedUserId) {
    throw new Error('Users cannot follow themselves');
  }

  const created = await dependencies.createFollow(userId, followedUserId);

  if (!created) {
    throw new Error('User is already being followed');
  }

  try {
    const user = await dependencies.getUser(userId);

    if (!user?.username) {
      return;
    }

    await dependencies.notifyUserFollowed({
      followerId: userId,
      followedUserId,
      followerUsername: user.username,
      followerImage: user.image,
      timestamp: new Date(),
    });
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: preserve follow notification failure diagnostics
    console.error('Failed to send follow notification:', error);
  }
}

export async function unfollowUser(
  userId: string,
  followedUserId: string,
  remove: typeof removeFollow = removeFollow
): Promise<void> {
  const removed = await remove(userId, followedUserId);

  if (!removed) {
    throw new Error('User is not followed');
  }
}
