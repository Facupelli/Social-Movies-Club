import 'server-only';

import type { MediaKind } from '@/modules/media-catalog/media.type';
import { scheduleStreamingProviderCatalogueSync } from '@/modules/streaming-providers/schedule-streaming-provider-catalogue-sync';
import { getStreamingProviderCatalogueSnapshot } from '@/modules/streaming-providers/streaming-provider-catalogue.pg';
import { classifyCatalogue } from '@/modules/streaming-providers/streaming-provider-catalogue-state';
import { syncStreamingProviderCatalogue } from '@/modules/streaming-providers/sync-streaming-provider-catalogue';
import { findStreamingPreferencesBase } from './streaming-preferences.pg';
import type { StreamingPreferencesSettings } from './streaming-preferences.types';

const CATALOGUE_KINDS: readonly MediaKind[] = ['movie', 'tv_series'];

/**
 * Loads a ready-to-render read model for the streaming-preferences settings
 * screen.
 *
 * This orchestration layer keeps TMDB, leases, cooldowns, and catalogue
 * synchronization out of the client. The preferences persistence module stays
 * independent from TMDB, and the provider synchronization service stays
 * independent from settings UI concerns.
 */
export async function loadStreamingPreferencesSettings(
  userId: string
): Promise<StreamingPreferencesSettings> {
  const base = await findStreamingPreferencesBase(userId);
  const selectedProviderIds = base.selectedProviders.map(
    (provider) => provider.id
  );

  if (base.countryCode === null) {
    return {
      countryCode: null,
      availableProviders: [],
      selectedProviders: base.selectedProviders,
      selectedProviderIds,
    };
  }

  const countryCode = base.countryCode;

  let snapshot = await getStreamingProviderCatalogueSnapshot(countryCode);

  const missingKinds: MediaKind[] = [];
  const staleKinds: MediaKind[] = [];

  for (const kind of CATALOGUE_KINDS) {
    const fetchedAt =
      kind === 'movie' ? snapshot.movieFetchedAt : snapshot.tvSeriesFetchedAt;
    const state = classifyCatalogue(fetchedAt);

    if (state === 'missing') {
      missingKinds.push(kind);
    } else if (state === 'stale') {
      staleKinds.push(kind);
    }
  }

  if (missingKinds.length > 0) {
    const results = await Promise.allSettled(
      missingKinds.map((kind) =>
        syncStreamingProviderCatalogue(countryCode, kind)
      )
    );

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        // biome-ignore lint/suspicious/noConsole: first-population failures need an operational signal.
        console.error(
          'Failed to synchronize missing streaming provider catalogue',
          {
            operation: 'loadStreamingPreferencesSettings',
            countryCode,
            kind: missingKinds[index],
            error: result.reason,
          }
        );
      }
    });

    snapshot = await getStreamingProviderCatalogueSnapshot(countryCode);
  }

  for (const kind of staleKinds) {
    scheduleStreamingProviderCatalogueSync(countryCode, kind);
  }

  return {
    countryCode,
    availableProviders: snapshot.providers,
    selectedProviders: base.selectedProviders,
    selectedProviderIds,
  };
}
