import { headers } from 'next/headers';
import {
  getMediaIdentityKey,
  type MediaIdentityKey,
} from '@/modules/media-catalog/media-identity';
import { WatchlistService } from '@/modules/watchlist/view-watchlist/watchlist.service';
import { auth } from '@/platform/auth/auth';
import {
  authenticatedJson,
  unauthorizedJson,
} from '@/shared/http/authenticated-response';

export type UseUserWatchlistMap = Record<MediaIdentityKey, boolean>;

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
    const identityKey = getMediaIdentityKey(result.tmdbId, result.type);
    if (!statusMap[identityKey]) {
      statusMap[identityKey] = true;
    }
  }

  return authenticatedJson(statusMap);
}
