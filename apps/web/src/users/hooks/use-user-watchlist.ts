import { queryOptions } from "@tanstack/react-query";
import type { UseUserWatchlistMap } from "@/app/api/user/watchlist/route";
import { QUERY_KEYS } from "@/lib/app.constants";

async function getUserWatchlist(
	signal?: AbortSignal,
): Promise<UseUserWatchlistMap> {
	const response = await fetch("/api/user/watchlist", {
		cache: "no-store",
		signal,
	});
	if (!response.ok) {
		throw new Error("Network response was not ok");
	}
	return response.json();
}

const getUserWatchlistQueryOptions = (userId: string | undefined) =>
	queryOptions({
		queryKey: QUERY_KEYS.getUserWatchlist(userId),
		queryFn: ({ signal }) => getUserWatchlist(signal),
		enabled: Boolean(userId),
		refetchOnWindowFocus: false,
	});

export { getUserWatchlistQueryOptions, getUserWatchlist };
