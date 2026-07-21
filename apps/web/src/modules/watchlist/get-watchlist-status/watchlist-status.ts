import 'server-only';

import { getMediaIdentityKey } from '@/modules/media-catalog/media-identity';
import type { WatchlistStatusMap } from '@/modules/watchlist/watchlist.types';
import { listWatchlistMediaIdentities } from './watchlist-status.pg';

export async function getWatchlistStatusMap(
  viewerUserId: string
): Promise<WatchlistStatusMap> {
  const identities = await listWatchlistMediaIdentities(viewerUserId);
  const statusMap: WatchlistStatusMap = {};

  for (const identity of identities) {
    statusMap[getMediaIdentityKey(identity.tmdbId, identity.type)] = true;
  }

  return statusMap;
}
