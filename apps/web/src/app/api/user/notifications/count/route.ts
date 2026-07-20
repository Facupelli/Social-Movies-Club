import { headers } from "next/headers";
import { auth } from "@/platform/auth/auth";
import { authenticatedJson, unauthorizedJson } from "@/shared/http/authenticated-response";
import { NotificationService } from "@/modules/notifications/list-notifications/notifications.service";

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
