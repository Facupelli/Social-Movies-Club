import { NotificationService } from '@/modules/notifications/list-notifications/notifications.service';
import {
  NotificationEventRegistry,
  type UserFollowedEvent,
} from '@/modules/notifications/notify-user-followed/notification-event-handler';
import { ProfileService } from '@/modules/profiles/profile.service';
import type {
  GetFollowingUsers,
  GetUserFollowsInfoMap,
} from '@/modules/social/follows.type';
import { FollowsPgRepository } from './follows.pg.repository';

const notificationService = new NotificationService();
const eventRegistry = new NotificationEventRegistry(notificationService);

const profileService = new ProfileService();

export class FollowService {
  private followPgRepository: FollowsPgRepository;

  constructor() {
    this.followPgRepository = new FollowsPgRepository();
  }

  async getFollowingUsers(
    userId: string,
    viewerUserId: string
  ): Promise<GetFollowingUsers[]> {
    return await this.followPgRepository.getFollowingUsers(
      userId,
      viewerUserId
    );
  }

  async getUserFollowsInfo(userId: string): Promise<GetUserFollowsInfoMap> {
    return await this.followPgRepository.getUserFollowsInfo(userId);
  }

  async isFollowingUser(
    userId: string,
    followedUserId: string
  ): Promise<boolean> {
    return await this.followPgRepository.isFollowingUser(
      userId,
      followedUserId
    );
  }

  async followUser(userId: string, followedUserId: string): Promise<void> {
    if (userId === followedUserId) {
      throw new Error('Users cannot follow themselves');
    }

    const isFollowingUser = await this.followPgRepository.isFollowingUser(
      userId,
      followedUserId
    );

    if (isFollowingUser) {
      throw new Error('User is already being followed');
    }

    await this.followPgRepository.followUser(userId, followedUserId);

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
    const isFollowingUser = await this.followPgRepository.isFollowingUser(
      userId,
      followedUserId
    );

    if (!isFollowingUser) {
      throw new Error('User is not followed');
    }

    await this.followPgRepository.unfollowUser(userId, followedUserId);
  }
}
