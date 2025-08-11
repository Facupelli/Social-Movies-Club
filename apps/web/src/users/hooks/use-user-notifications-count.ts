import { queryOptions } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/app.constants";

async function getUserNotificationsCount(): Promise<number> {
	const response = await fetch("/api/user/notifications/count");
	if (!response.ok) {
		throw new Error("Network response was not ok");
	}
	return response.json();
}

const getUserNotificationsCountQueryOptions = queryOptions({
	queryKey: QUERY_KEYS.USER_NOTIFICATIONS_COUNT,
	queryFn: () => getUserNotificationsCount(),
	refetchOnWindowFocus: false,
});

export { getUserNotificationsCountQueryOptions };
