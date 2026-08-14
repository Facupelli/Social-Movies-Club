import 'server-only';

import { listStreamingProvidersForCountry } from '@/modules/streaming-providers/streaming-provider-catalogue.pg';
import { findStreamingPreferencesBase } from './streaming-preferences.pg';
import type { StreamingPreferences } from './streaming-preferences.types';

/**
 * Assembles the streaming-preferences read model for the settings screen.
 *
 * This is a local, PostgreSQL-only read: it never triggers TMDB catalogue
 * synchronization. Catalogue synchronization remains the responsibility of the
 * future settings orchestration.
 */
export async function getStreamingPreferences(
  userId: string
): Promise<StreamingPreferences> {
  const base = await findStreamingPreferencesBase(userId);

  const availableProviders = base.countryCode
    ? await listStreamingProvidersForCountry(base.countryCode)
    : [];

  return {
    countryCode: base.countryCode,
    availableProviders,
    selectedProviders: base.selectedProviders,
    selectedProviderIds: base.selectedProviders.map((provider) => provider.id),
  };
}
