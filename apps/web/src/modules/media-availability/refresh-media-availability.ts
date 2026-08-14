import 'server-only';

import { TmdbService } from '@/platform/tmdb/tmdb.service';
import {
  MEDIA_AVAILABILITY_FRESHNESS_MS,
  MEDIA_AVAILABILITY_LEASE_MS,
} from './media-availability.constants';
import {
  claimMediaAvailabilityRefresh,
  getMediaAvailabilityIdentity,
  persistMediaAvailability,
} from './media-availability.pg';
import { parsePositiveTmdbId } from './media-availability.validation';

type RefreshMediaAvailabilityDependencies = {
  tmdb: Pick<TmdbService, 'getMediaWatchProviders'>;
  claim: typeof claimMediaAvailabilityRefresh;
  getIdentity: typeof getMediaAvailabilityIdentity;
  persist: typeof persistMediaAvailability;
};

const defaultDependencies: RefreshMediaAvailabilityDependencies = {
  tmdb: new TmdbService(),
  claim: claimMediaAvailabilityRefresh,
  getIdentity: getMediaAvailabilityIdentity,
  persist: persistMediaAvailability,
};

/**
 * Refreshes one media availability projection. Failed work preserves the old
 * snapshot and leaves the short lease in place until it expires.
 */
export async function refreshMediaAvailability(
  mediaId: string,
  dependencies: RefreshMediaAvailabilityDependencies = defaultDependencies
): Promise<void> {
  const now = new Date();
  const claimed = await dependencies.claim(
    mediaId,
    now,
    new Date(now.getTime() - MEDIA_AVAILABILITY_FRESHNESS_MS),
    new Date(now.getTime() + MEDIA_AVAILABILITY_LEASE_MS)
  );

  if (!claimed) {
    return;
  }

  const identity = await dependencies.getIdentity(mediaId);
  if (!identity) {
    return;
  }

  if (identity.externalId === null) {
    return;
  }

  const tmdbId = parsePositiveTmdbId(identity.externalId);
  if (tmdbId === null) {
    return;
  }

  const availability = await dependencies.tmdb.getMediaWatchProviders(
    tmdbId,
    identity.kind
  );

  await dependencies.persist(mediaId, availability, new Date());
}
