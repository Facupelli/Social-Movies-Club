import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { WatchlistService } from "@/watchlist/watchlist.service";

export type UseUserWatchlistMap = Record<number, boolean>;

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return Response.json({ success: false, error: "Unauthorized" });
  }

  const watchlistService = new WatchlistService();

  const res = await watchlistService.getWatchlist(session.user.id);

  const statusMap: UseUserWatchlistMap = {};

  res.forEach((result) => {
    if (!statusMap[result.movieTmdbId]) {
      statusMap[result.movieTmdbId] = true;
    }
  });

  return Response.json(statusMap);
}
