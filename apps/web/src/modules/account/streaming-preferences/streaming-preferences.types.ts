import type { LocalStreamingProvider } from '@/modules/streaming-providers/streaming-provider.types';

/**
 * A provider from the local regional catalogue. It is derived data and can
 * change whenever the catalogue is synchronized with TMDB.
 */
export type AvailableStreamingProvider = LocalStreamingProvider;

/**
 * Canonical metadata for a provider the user has explicitly selected.
 * Selections are authoritative user data and never depend on regional
 * catalogue membership.
 */
export type SelectedStreamingProvider = {
  id: string;
  tmdbProviderId: number;
  name: string;
  logoPath: string | null;
};

/**
 * Read model for the future streaming-preferences settings screen.
 *
 * `selectedProviderIds` is derived from `selectedProviders` for convenience;
 * the two always describe the same authoritative selection.
 */
export type StreamingPreferences = {
  countryCode: string | null;
  availableProviders: AvailableStreamingProvider[];
  selectedProviders: SelectedStreamingProvider[];
  selectedProviderIds: string[];
};
