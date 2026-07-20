import { FollowNotificationService } from '@/modules/notifications/notify-user-followed/follow-notification.service';
import {
  NotificationEventRegistry,
  type UserFollowedEvent,
} from '@/modules/notifications/notify-user-followed/notification-event-handler';
import { ProfileService } from '@/modules/profiles/profile.service';
import { FollowPgRepository } from './follow.pg.repository';

const notificationService = new FollowNotificationService();
const eventRegistry = new NotificationEventRegistry(notificationService);

const profileService = new ProfileService();

export class FollowService {
  constructor(
    private readonly repository: FollowPgRepository = new FollowPgRepository()
  ) {}

  async followUser(userId: string, followedUserId: string): Promise<void> {
    if (userId === followedUserId) {
      throw new Error('Users cannot follow themselves');
    }

    const created = await this.repository.follow(userId, followedUserId);

    if (!created) {
      throw new Error('User is already being followed');
    }

    try {
      const user = await profileService.getUser(userId);

      if (!user?.username) {
        return;
      }

      const event: UserFollowedEvent = {
        followerId: userId,
        followedUserId,
        followerUsername: user.username,
        followerImage: user.image,
        timestamp: new Date(),
      };

      await eventRegistry.handleEvent('user_followed', event);
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: preserve follow notification failure diagnostics
      console.error('Failed to send follow notification:', error);
    }
  }

  async unfollowUser(userId: string, followedUserId: string): Promise<void> {
    const removed = await this.repository.unfollow(userId, followedUserId);

    if (!removed) {
      throw new Error('User is not followed');
    }
  }
}
