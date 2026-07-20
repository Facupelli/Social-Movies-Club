import { headers } from 'next/headers';
import { getMediaIdentityKey } from '@/modules/media-catalog/media-identity';
import { listWatchlistMediaIdentities } from '@/modules/watchlist/get-watchlist-status/watchlist-status.pg';
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

  const mediaIdentities = await listWatchlistMediaIdentities(session.user.id);

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
