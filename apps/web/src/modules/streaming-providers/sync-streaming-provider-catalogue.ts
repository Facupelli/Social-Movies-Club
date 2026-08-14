import 'server-only';

import { TmdbService } from '@/platform/tmdb/tmdb.service';
import {
  STREAMING_PROVIDER_CATALOGUE_FRESHNESS_MS,
  STREAMING_PROVIDER_CATALOGUE_LEASE_MS,
} from './streaming-provider.constants';
import { assertValidCountryCode } from './streaming-provider.validation';
import {
  claimStreamingProviderCatalogueSync,
  persistStreamingProviderCatalogue,
} from './streaming-provider-catalogue.pg';

type SyncStreamingProviderCatalogueDependencies = {
  tmdb: Pick<TmdbService, 'getWatchProvidersForRegion'>;
  claim: typeof claimStreamingProviderCatalogueSync;
  persist: typeof persistStreamingProviderCatalogue;
};

const defaultDependencies: SyncStreamingProviderCatalogueDependencies = {
  tmdb: new TmdbService(),
  claim: claimStreamingProviderCatalogueSync,
  persist: persistStreamingProviderCatalogue,
};

/**
 * Synchronizes a country's complete movie and TV provider catalogue with TMDB.
 * Failed refreshes preserve the previous snapshot and retain the short lease
 * until it expires.
 */
export async function syncStreamingProviderCatalogue(
  countryCode: string,
  dependencies: SyncStreamingProviderCatalogueDependencies = defaultDependencies
): Promise<void> {
  assertValidCountryCode(countryCode);

  const now = new Date();
  const claimed = await dependencies.claim(
    countryCode,
    now,
    new Date(now.getTime() - STREAMING_PROVIDER_CATALOGUE_FRESHNESS_MS),
    new Date(now.getTime() + STREAMING_PROVIDER_CATALOGUE_LEASE_MS)
  );

  if (!claimed) {
    return;
  }

  const [movieCatalogue, tvSeriesCatalogue] = await Promise.all([
    dependencies.tmdb.getWatchProvidersForRegion(countryCode, 'movie'),
    dependencies.tmdb.getWatchProvidersForRegion(countryCode, 'tv_series'),
  ]);

  await dependencies.persist(
    countryCode,
    movieCatalogue.providers,
    tvSeriesCatalogue.providers,
    new Date()
  );
}
