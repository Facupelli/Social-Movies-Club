"use server";

import { withAuth } from "@/lib/auth/auth-server-action.middleware";
import { NotificationService } from "../notifications.service";

export async function markNotiAsRead() {
	return await withAuth(async (session) => {
		try {
			const notificationService = new NotificationService();
			await notificationService.markAllAsRead(session.user.id);

			return { success: true };
		} catch (error) {
			console.log("Server-Action [MARK NOTI AS READ] Error:", error);
			return { success: false };
		}
	});
}
