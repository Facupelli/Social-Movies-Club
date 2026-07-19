import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { authenticatedJson, unauthorizedJson } from "@/lib/http/authenticated-response";
import { NotificationService } from "@/notifications/notifications.service";

export async function GET() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return unauthorizedJson();
	}

	const notificationService = new NotificationService();

	const res = await notificationService.getUnreadNotificationCount(
		session.user.id,
	);
	return authenticatedJson(res);
}
