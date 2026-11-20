import 'server-only';

import type { MediaKind } from '@/modules/media-catalog/media.type';
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
  const identity = await dependencies.getIdentity(mediaId);
  if (!identity || identity.externalId === null) {
    return;
  }

  const tmdbId = parsePositiveTmdbId(identity.externalId);
  if (tmdbId === null) {
    return;
  }

  await refreshMediaAvailabilityByTmdbIdentity(
    mediaId,
    tmdbId,
    identity.kind,
    dependencies
  );
}

export async function refreshMediaAvailabilityByTmdbIdentity(
  mediaId: string,
  tmdbId: number,
  kind: MediaKind,
  dependencies: RefreshMediaAvailabilityDependencies = defaultDependencies
) {
  const now = new Date();
  const leaseUntil = new Date(now.getTime() + MEDIA_AVAILABILITY_LEASE_MS);
  const claimed = await dependencies
    .claim(
      mediaId,
      now,
      new Date(now.getTime() - MEDIA_AVAILABILITY_FRESHNESS_MS),
      leaseUntil
    )
    .catch(() => null);

  if (claimed === false) {
    return null;
  }

  const availability = await dependencies.tmdb.getMediaWatchProviders(
    tmdbId,
    kind
  );
  if (claimed) {
    await dependencies
      .persist(
        mediaId,
        availability,
        new Date(availability.fetchedAt),
        leaseUntil
      )
      .catch(() => null);
  }
  return availability;
}
