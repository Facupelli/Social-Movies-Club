import type { NotificationService } from '@/modules/notifications/list-notifications/notifications.service';
import { createFollowNotification } from './notification.factory';

export interface UserFollowedEvent {
  followerId: string;
  followedUserId: string;
  followerUsername: string;
  followerImage: string | null;
  timestamp: Date;
}

export interface EventHandler<T> {
  handle(event: T): Promise<boolean>;
}

export class NotificationEventRegistry {
  private handlers = new Map<string, (event: unknown) => Promise<boolean>>();

  constructor(notificationService: NotificationService) {
    this.registerHandler(
      'user_followed',
      new UserFollowEventHandler(notificationService)
    );
  }

  async handleEvent(eventType: string, event: unknown): Promise<boolean> {
    const handler = this.handlers.get(eventType);
    if (!handler) {
      // biome-ignore lint/suspicious/noConsole: preserve event registration diagnostics
      console.warn(`No handler found for event type: ${eventType}`);
      return false;
    }

    try {
      return await handler(event);
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: preserve event handler failure diagnostics
      console.error(`Error handling event ${eventType}:`, error);
      return false;
    }
  }

  registerHandler<T>(eventType: string, handler: EventHandler<T>): void {
    this.handlers.set(eventType, (event) => handler.handle(event as T));
  }

  getRegisteredEvents(): string[] {
    return Array.from(this.handlers.keys());
  }
}

export class UserFollowEventHandler implements EventHandler<UserFollowedEvent> {
  constructor(private notificationService: NotificationService) {}

  async handle(event: UserFollowedEvent): Promise<boolean> {
    const { followerId, followedUserId, followerUsername, followerImage } =
      event;

    if (followerId === followedUserId) {
      return false;
    }

    // Check for duplicate notifications within 24 hours
    // const hasDuplicate = await this.notificationService.hasRecentNotification(
    // 	followedUserId,
    // 	"user_follow",
    // 	followerId,
    // 	24,
    // );

    // if (hasDuplicate) {
    // 	return false; // Prevent spam
    // }

    // Create notification using factory
    const notification = createFollowNotification({
      recipientId: followedUserId,
      actorId: followerId,
      actorUsername: followerUsername,
      actorImage: followerImage,
    });

    return await this.notificationService.createNotification(notification);
  }
}
