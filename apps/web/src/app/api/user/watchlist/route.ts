import { headers } from 'next/headers';
import { getMediaIdentityKey } from '@/modules/media-catalog/media-identity';
import { WatchlistStatusService } from '@/modules/watchlist/get-watchlist-status/watchlist-status.service';
import type { WatchlistStatusMap } from '@/modules/watchlist/get-watchlist-status/watchlist-status.types';
import { auth } from '@/platform/auth/auth';
import {
  authenticatedJson,
  unauthorizedJson,
} from '@/shared/http/authenticated-response';

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return unauthorizedJson();
  }

  const watchlistStatusService = new WatchlistStatusService();

  const mediaIdentities = await watchlistStatusService.listMediaIdentities(
    session.user.id
  );

  const statusMap: WatchlistStatusMap = {};

  for (const mediaIdentity of mediaIdentities) {
    const identityKey = getMediaIdentityKey(
      mediaIdentity.tmdbId,
      mediaIdentity.type
    );
    if (!statusMap[identityKey]) {
      statusMap[identityKey] = true;
    }
  }

  return authenticatedJson(statusMap);
}
