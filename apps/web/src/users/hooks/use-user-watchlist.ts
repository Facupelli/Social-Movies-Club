import { queryOptions } from "@tanstack/react-query";
import type { UseUserWatchlistMap } from "@/app/api/user/watchlist/route";
import { QUERY_KEYS } from "@/lib/app.constants";

async function getUserWatchlist(): Promise<UseUserWatchlistMap> {
	const response = await fetch("/api/user/watchlist");
	if (!response.ok) {
		throw new Error("Network response was not ok");
	}
	return response.json();
}

const getUserWatchlistQueryOptions = queryOptions({
	queryKey: QUERY_KEYS.USER_WATCHLIST,
	queryFn: () => getUserWatchlist(),
	refetchOnWindowFocus: false,
});

export { getUserWatchlistQueryOptions, getUserWatchlist };
