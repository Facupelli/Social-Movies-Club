import 'server-only';

import { after } from 'next/server';
import { STREAMING_PROVIDER_CATALOGUE_FRESHNESS_MS } from '@/modules/streaming-providers/streaming-provider.constants';
import { getStreamingProviderCatalogueSnapshot } from '@/modules/streaming-providers/streaming-provider-catalogue.pg';
import { syncStreamingProviderCatalogue } from '@/modules/streaming-providers/sync-streaming-provider-catalogue';
import { findStreamingPreferencesBase } from './streaming-preferences.pg';
import type { StreamingPreferencesSettings } from './streaming-preferences.types';

/**
 * Loads the settings read model while keeping catalogue synchronization details
 * internal to the server.
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

  if (snapshot.fetchedAt === null) {
    try {
      await syncStreamingProviderCatalogue(countryCode);
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: first-population failures need an operational signal.
      console.error(
        'Failed to synchronize missing streaming provider catalogue',
        {
          operation: 'loadStreamingPreferencesSettings',
          countryCode,
          error,
        }
      );
    }

    snapshot = await getStreamingProviderCatalogueSnapshot(countryCode);
  } else if (
    snapshot.fetchedAt.getTime() <
    Date.now() - STREAMING_PROVIDER_CATALOGUE_FRESHNESS_MS
  ) {
    after(async () => {
      try {
        await syncStreamingProviderCatalogue(countryCode);
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: background failures need an operational signal.
        console.error(
          'Failed to synchronize streaming provider catalogue after response',
          {
            operation: 'loadStreamingPreferencesSettings',
            countryCode,
            error,
          }
        );
      }
    });
  }

  return {
    countryCode,
    availableProviders: snapshot.providers,
    selectedProviders: base.selectedProviders,
    selectedProviderIds,
  };
}
