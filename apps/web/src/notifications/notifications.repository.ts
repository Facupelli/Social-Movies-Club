import { and, count, desc, eq, isNull, lt, sql } from "drizzle-orm";
import { withDatabase } from "@/infra/postgres/db-utils";
import {
	type NewNotification,
	type Notification,
	type NotificationType,
	notifications,
	notificationTypes,
} from "@/infra/postgres/schema";

export type NotificationCursor = {
	createdAt: Date;
	id: string;
};

export interface NotificationFilters {
	recipientId: string;
	includeRead?: boolean;
	typeId?: string;
	limit?: number;
	cursor?: NotificationCursor;
}

export interface PaginatedNotifications {
	data: Array<Notification & { type: NotificationType }>;
	hasMore: boolean;
	nextCursor?: NotificationCursor;
}

export class NotificationRepository {
	async getNotifications(
		filters: NotificationFilters,
	): Promise<PaginatedNotifications> {
		const {
			recipientId,
			includeRead = true,
			typeId,
			limit = 20,
			cursor,
		} = filters;

		return await withDatabase(async (db) => {
			const conditions = [
				eq(notifications.recipientId, recipientId),
				eq(notifications.isDeleted, false),
			];

			if (!includeRead) {
				conditions.push(isNull(notifications.readAt));
			}

			console.log({ includeRead, lol: !includeRead });

			if (typeId) {
				conditions.push(eq(notifications.typeId, typeId));
			}

			if (cursor) {
				conditions.push(lt(notifications.createdAt, cursor.createdAt));
			}

			const results = await db
				.select({
					notification: notifications,
					type: notificationTypes,
				})
				.from(notifications)
				.innerJoin(
					notificationTypes,
					eq(notifications.typeId, notificationTypes.id),
				)
				.where(and(...conditions))
				.orderBy(desc(notifications.createdAt))
				.limit(limit + 1);

			const hasMore = results.length > limit;
			const data = results.slice(0, limit).map((row) => ({
				...row.notification,
				type: row.type,
			}));

			const nextCursor =
				hasMore && data.length > 0
					? {
							createdAt: data[data.length - 1].createdAt,
							id: data[data.length - 1].id,
						}
					: undefined;

			return {
				data,
				hasMore,
				nextCursor,
			};
		});
	}

	async getUnreadCount(recipientId: string): Promise<number> {
		return await withDatabase(async (db) => {
			try {
				const result = await db
					.select({ count: count() })
					.from(notifications)
					.where(
						and(
							eq(notifications.recipientId, recipientId),
							eq(notifications.isDeleted, false),
							isNull(notifications.readAt),
						),
					);

				return result[0]?.count ?? 0;
			} catch (error) {
				console.error("Error fetching unread notification count:", error);
				throw new Error("Failed to fetch unread notification count");
			}
		});
	}

	async markAsRead(id: string, userId: string): Promise<boolean> {
		return await withDatabase(async (db) => {
			const [updated] = await db
				.update(notifications)
				.set({
					readAt: new Date(),
					updatedAt: new Date(),
				})
				.where(
					and(
						eq(notifications.id, id),
						eq(notifications.recipientId, userId),
						isNull(notifications.readAt),
						eq(notifications.isDeleted, false),
					),
				)
				.returning({ id: notifications.id });

			return !!updated;
		});
	}

	async markAllAsRead(recipientId: string): Promise<number> {
		return await withDatabase(async (db) => {
			const updated = await db
				.update(notifications)
				.set({
					readAt: new Date(),
					updatedAt: new Date(),
				})
				.where(
					and(
						eq(notifications.recipientId, recipientId),
						isNull(notifications.readAt),
						eq(notifications.isDeleted, false),
					),
				)
				.returning({ id: notifications.id });

			return updated.length;
		});
	}

	async createNotification(notification: NewNotification) {
		const {
			recipientId,
			typeId,
			actorId,
			title,
			message,
			metadata,
			actionUrl,
			actorUsername,
			actorImage,
		} = notification;

		return await withDatabase(async (db) => {
			const { rows } = await db.execute(sql`
				INSERT INTO ${notifications}
					(recipient_id, type_id, actor_id, actor_username, actor_image,
					title, message, metadata, action_url)
				VALUES
					(${recipientId}, ${typeId}, ${actorId}, ${actorUsername},
					${actorImage}, ${title}, ${message}, ${metadata}, ${actionUrl})
				RETURNING *
			`);

			return rows[0];
		});
	}

	async createNotifications(notificationList: NewNotification[]) {
		return await withDatabase(async (db) => {
			const { rows } = await db.execute(
				sql`
          INSERT INTO ${notifications} ("recipient_id", "type_id", "actor_id", "title", "message", "metadata", "action_url")
          VALUES ${notificationList.map((noti) => `(${noti.recipientId}, ${noti.typeId}, ${noti.actorId}, ${noti.title}, ${noti.message}, ${noti.metadata}, ${noti.actionUrl})`)}
          RETURNING *
        `,
			);

			return rows;
		});
	}

	async deleteNotification(id: string, userId: string): Promise<boolean> {
		return await withDatabase(async (db) => {
			const [deleted] = await db
				.update(notifications)
				.set({
					isDeleted: true,
					updatedAt: new Date(),
				})
				.where(
					and(
						eq(notifications.id, id),
						eq(notifications.recipientId, userId),
						eq(notifications.isDeleted, false),
					),
				)
				.returning({ id: notifications.id });

			return !!deleted;
		});
	}
}
