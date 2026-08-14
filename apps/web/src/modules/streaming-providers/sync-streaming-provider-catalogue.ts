import 'server-only';

import type { MediaKind } from '@/modules/media-catalog/media.type';
import { TmdbService } from '@/platform/tmdb/tmdb.service';
import { TmdbHttpError } from '@/platform/tmdb/tmdb-http-error';
import {
  STREAMING_PROVIDER_CATALOGUE_COOLDOWN_FALLBACK_MS,
  STREAMING_PROVIDER_CATALOGUE_FRESHNESS_MS,
  STREAMING_PROVIDER_CATALOGUE_LEASE_MS,
} from './streaming-provider.constants';
import type { StreamingProviderCatalogueSyncResult } from './streaming-provider.types';
import {
  assertValidCountryCode,
  assertValidMediaKind,
} from './streaming-provider.validation';
import {
  claimStreamingProviderCatalogueSync,
  persistStreamingProviderCatalogue,
  recordStreamingProviderCatalogueCooldown,
  releaseStreamingProviderCatalogueLease,
} from './streaming-provider-catalogue.pg';

type SyncStreamingProviderCatalogueDependencies = {
  tmdb: Pick<TmdbService, 'getWatchProvidersForRegion'>;
  claim: typeof claimStreamingProviderCatalogueSync;
  persist: typeof persistStreamingProviderCatalogue;
  recordCooldown: typeof recordStreamingProviderCatalogueCooldown;
  releaseLease: typeof releaseStreamingProviderCatalogueLease;
};

const defaultDependencies: SyncStreamingProviderCatalogueDependencies = {
  tmdb: new TmdbService(),
  claim: claimStreamingProviderCatalogueSync,
  persist: persistStreamingProviderCatalogue,
  recordCooldown: recordStreamingProviderCatalogueCooldown,
  releaseLease: releaseStreamingProviderCatalogueLease,
};

/**
 * Synchronizes the local streaming-provider catalogue for one country + kind
 * with TMDB. Fresh catalogues and active leases/cooldowns skip the external
 * call; a successful TMDB snapshot is persisted transactionally.
 */
export async function syncStreamingProviderCatalogue(
  countryCode: string,
  kind: MediaKind,
  dependencies: SyncStreamingProviderCatalogueDependencies = defaultDependencies
): Promise<StreamingProviderCatalogueSyncResult> {
  assertValidCountryCode(countryCode);
  assertValidMediaKind(kind);

  const now = new Date();
  const staleBefore = new Date(
    now.getTime() - STREAMING_PROVIDER_CATALOGUE_FRESHNESS_MS
  );
  const leaseUntil = new Date(
    now.getTime() + STREAMING_PROVIDER_CATALOGUE_LEASE_MS
  );

  const claim = await dependencies.claim(
    countryCode,
    kind,
    now,
    staleBefore,
    leaseUntil
  );

  if (claim.status !== 'claimed') {
    return claim;
  }

  try {
    const catalogue = await dependencies.tmdb.getWatchProvidersForRegion(
      countryCode,
      kind
    );

    await dependencies.persist(
      countryCode,
      kind,
      catalogue.providers,
      new Date()
    );

    return {
      status: 'refreshed',
      providerCount: catalogue.providers.length,
    };
  } catch (error) {
    if (error instanceof TmdbHttpError && error.status === 429) {
      const retryAfterMs =
        error.retryAfterSeconds === undefined
          ? STREAMING_PROVIDER_CATALOGUE_COOLDOWN_FALLBACK_MS
          : error.retryAfterSeconds * 1000;

      try {
        await dependencies.recordCooldown(
          countryCode,
          kind,
          new Date(Date.now() + retryAfterMs)
        );
      } catch {
        // Cooldown persistence is best-effort. Preserve the original TMDB error.
      }

      throw error;
    }

    try {
      await dependencies.releaseLease(countryCode, kind);
    } catch {
      // Lease release is best-effort. The lease expires on its own.
    }

    throw error;
  }
}
