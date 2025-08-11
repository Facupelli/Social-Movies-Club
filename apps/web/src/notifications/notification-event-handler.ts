import { createFollowNotification } from "./notification.factory";
import type { NotificationService } from "./notifications.service";

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
	private handlers: Map<string, EventHandler<any>> = new Map();

	constructor(notificationService: NotificationService) {
		this.handlers.set(
			"user_followed",
			new UserFollowEventHandler(notificationService),
		);
	}

	async handleEvent<T>(eventType: string, event: T): Promise<boolean> {
		const handler = this.handlers.get(eventType);
		if (!handler) {
			console.warn(`No handler found for event type: ${eventType}`);
			return false;
		}

		try {
			return await handler.handle(event);
		} catch (error) {
			console.error(`Error handling event ${eventType}:`, error);
			return false;
		}
	}

	registerHandler<T>(eventType: string, handler: EventHandler<T>): void {
		this.handlers.set(eventType, handler);
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
