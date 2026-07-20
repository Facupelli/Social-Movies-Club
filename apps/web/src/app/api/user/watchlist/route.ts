import { headers } from "next/headers";
import { auth } from "@/platform/auth/auth";
import { authenticatedJson, unauthorizedJson } from "@/shared/http/authenticated-response";
import { WatchlistService } from "@/modules/watchlist/view-watchlist/watchlist.service";

export type UseUserWatchlistMap = Record<number, boolean>;

export async function GET() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return unauthorizedJson();
	}

	const watchlistService = new WatchlistService();

	const res = await watchlistService.getWatchlist(session.user.id);

	const statusMap: UseUserWatchlistMap = {};

	for (const result of res) {
		if (!statusMap[result.tmdbId]) {
			statusMap[result.tmdbId] = true;
		}
	}

	return authenticatedJson(statusMap);
}
