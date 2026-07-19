import type { NewNotification } from "@/infra/postgres/schema";
import {
	type NotificationFilters,
	NotificationRepository,
	type PaginatedNotifications,
} from "./notifications.repository";

export interface NotificationServiceConfig {
	maxNotificationsPerUser?: number;
	defaultPageSize?: number;
}

export class NotificationService {
	private config: Required<NotificationServiceConfig>;
	private repository: NotificationRepository;

	constructor(config: NotificationServiceConfig = {}) {
		this.repository = new NotificationRepository();
		this.config = {
			maxNotificationsPerUser: 1000,
			defaultPageSize: 20,
			...config,
		};
	}

	async getUnreadNotificationCount(userId: string): Promise<number> {
		try {
			const count = await this.repository.getUnreadCount(userId);
			return count;
		} catch (error) {
			console.error(`Failed to get unread count for user ${userId}:`, error);
			return 0;
		}
	}

	async getUserNotifications(
		userId: string,
		options: {
			includeRead?: boolean;
			typeId?: string;
			limit?: number;
			cursor?: { createdAt: Date; id: string };
		} = {},
	): Promise<PaginatedNotifications> {
		const filters: NotificationFilters = {
			recipientId: userId,
			includeRead: options.includeRead ?? false,
			typeId: options.typeId,
			limit: options.limit ?? this.config.defaultPageSize,
			cursor: options.cursor,
		};

		return await this.repository.getNotifications(filters);
	}

	async markAsRead(notificationId: string, userId: string): Promise<boolean> {
		return await this.repository.markAsRead(notificationId, userId);
	}

	async markAllAsRead(userId: string): Promise<number> {
		return await this.repository.markAllAsRead(userId);
	}

	async createNotification(notification: NewNotification): Promise<boolean> {
		try {
			await this.repository.createNotification(notification);

			// Cleanup old notifications if user has too many (background cleanup)
			// this.cleanupOldNotifications(notification.recipientId).catch(error => {
			//   console.error('Failed to cleanup old notifications:', error);
			// });

			return true;
		} catch (error) {
			console.error("Failed to create notification:", error);
			return false;
		}
	}

	async createBulkNotifications(
		notifications: NewNotification[],
	): Promise<boolean> {
		try {
			await this.repository.createNotifications(notifications);
			return true;
		} catch (error) {
			console.error("Failed to create bulk notifications:", error);
			return false;
		}
	}

}
