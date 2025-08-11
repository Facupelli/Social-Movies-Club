import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { NotificationService } from "@/notifications/notifications.service";

export type UseUserWatchlistMap = Record<number, boolean>;

export async function GET() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return Response.json({ success: false, error: "Unauthorized" });
	}

	const notificationService = new NotificationService();

	const res = await notificationService.getUnreadNotificationCount(
		session.user.id,
	);
	return Response.json(res);
}
