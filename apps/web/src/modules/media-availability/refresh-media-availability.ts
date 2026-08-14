import 'server-only';

import { TmdbService } from '@/platform/tmdb/tmdb.service';
import { TmdbHttpError } from '@/platform/tmdb/tmdb-http-error';
import {
  MEDIA_AVAILABILITY_COOLDOWN_FALLBACK_MS,
  MEDIA_AVAILABILITY_FRESHNESS_MS,
  MEDIA_AVAILABILITY_LEASE_MS,
} from './media-availability.constants';
import {
  claimMediaAvailabilityRefresh,
  getMediaAvailabilityIdentity,
  persistMediaAvailability,
  recordMediaAvailabilityCooldown,
  releaseMediaAvailabilityLease,
} from './media-availability.pg';
import type { MediaAvailabilityRefreshResult } from './media-availability.types';
import { parsePositiveTmdbId } from './media-availability.validation';

type RefreshMediaAvailabilityDependencies = {
  tmdb: Pick<TmdbService, 'getMediaWatchProviders'>;
  claim: typeof claimMediaAvailabilityRefresh;
  getIdentity: typeof getMediaAvailabilityIdentity;
  persist: typeof persistMediaAvailability;
  recordCooldown: typeof recordMediaAvailabilityCooldown;
  releaseLease: typeof releaseMediaAvailabilityLease;
};

const defaultDependencies: RefreshMediaAvailabilityDependencies = {
  tmdb: new TmdbService(),
  claim: claimMediaAvailabilityRefresh,
  getIdentity: getMediaAvailabilityIdentity,
  persist: persistMediaAvailability,
  recordCooldown: recordMediaAvailabilityCooldown,
  releaseLease: releaseMediaAvailabilityLease,
};

/**
 * Refreshes the local availability projection for one media item. Fresh media,
 * active leases, and active cooldowns skip the external TMDB call; a single
 * all-region TMDB response atomically replaces the previous local snapshot.
 *
 * External API failures are thrown rather than returned so callers can decide
 * how to surface or retry them.
 */
export async function refreshMediaAvailability(
  mediaId: string,
  dependencies: RefreshMediaAvailabilityDependencies = defaultDependencies
): Promise<MediaAvailabilityRefreshResult> {
  const now = new Date();
  const staleBefore = new Date(now.getTime() - MEDIA_AVAILABILITY_FRESHNESS_MS);
  const leaseUntil = new Date(now.getTime() + MEDIA_AVAILABILITY_LEASE_MS);

  const claim = await dependencies.claim(mediaId, now, staleBefore, leaseUntil);

  if (claim.status !== 'claimed') {
    return claim;
  }

  try {
    const identity = await dependencies.getIdentity(mediaId);

    if (!identity) {
      await releaseLeaseBestEffort(dependencies, mediaId);
      return { status: 'unavailable', reason: 'media-not-found' };
    }

    if (identity.externalId === null) {
      await releaseLeaseBestEffort(dependencies, mediaId);
      return { status: 'unavailable', reason: 'tmdb-external-id-missing' };
    }

    const tmdbId = parsePositiveTmdbId(identity.externalId);
    if (tmdbId === null) {
      await releaseLeaseBestEffort(dependencies, mediaId);
      return { status: 'unavailable', reason: 'tmdb-external-id-invalid' };
    }

    const availability = await dependencies.tmdb.getMediaWatchProviders(
      tmdbId,
      identity.kind
    );

    const persisted = await dependencies.persist(
      mediaId,
      availability,
      new Date()
    );

    return {
      status: 'refreshed',
      countryCount: persisted.countryCount,
      offerCount: persisted.offerCount,
    };
  } catch (error) {
    if (error instanceof TmdbHttpError && error.status === 429) {
      const retryAfterMs =
        error.retryAfterSeconds === undefined
          ? MEDIA_AVAILABILITY_COOLDOWN_FALLBACK_MS
          : error.retryAfterSeconds * 1000;

      try {
        await dependencies.recordCooldown(
          mediaId,
          new Date(Date.now() + retryAfterMs)
        );
      } catch {
        // Cooldown persistence is best-effort. Preserve the original TMDB error.
      }

      throw error;
    }

    try {
      await dependencies.releaseLease(mediaId);
    } catch {
      // Lease release is best-effort. The lease expires on its own.
    }

    throw error;
  }
}

async function releaseLeaseBestEffort(
  dependencies: RefreshMediaAvailabilityDependencies,
  mediaId: string
): Promise<void> {
  try {
    await dependencies.releaseLease(mediaId);
  } catch {
    // Lease release is best-effort. The lease expires on its own.
  }
}
