import { STREAMING_PROVIDER_CATALOGUE_FRESHNESS_MS } from './streaming-provider.constants';
import type { StreamingProviderCatalogueState } from './streaming-provider.types';

/**
 * Classifies a persisted catalogue sync timestamp for the settings loader.
 *
 * This is an internal provider-catalogue concern: the account/UI read model
 * never sees these states. A null timestamp means the catalogue has never been
 * successfully synchronized; otherwise the same seven-day freshness window
 * used by catalogue synchronization distinguishes fresh from stale.
 */
export function classifyCatalogue(
  fetchedAt: Date | null,
  now: Date = new Date()
): StreamingProviderCatalogueState {
  if (fetchedAt === null) {
    return 'missing';
  }

  const staleBefore = new Date(
    now.getTime() - STREAMING_PROVIDER_CATALOGUE_FRESHNESS_MS
  );
  return fetchedAt >= staleBefore ? 'fresh' : 'stale';
}
