import { queryOptions } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/utilities/app.constants";

async function getUserNotificationsCount(signal?: AbortSignal): Promise<number> {
	const response = await fetch("/api/user/notifications/count", {
		cache: "no-store",
		signal,
	});
	if (!response.ok) {
		throw new Error("Network response was not ok");
	}
	return response.json();
}

const getUserNotificationsCountQueryOptions = (userId: string | undefined) =>
	queryOptions({
		queryKey: QUERY_KEYS.getUserNotificationsCount(userId),
		queryFn: ({ signal }) => getUserNotificationsCount(signal),
		enabled: Boolean(userId),
		refetchOnWindowFocus: false,
	});

export { getUserNotificationsCountQueryOptions };
