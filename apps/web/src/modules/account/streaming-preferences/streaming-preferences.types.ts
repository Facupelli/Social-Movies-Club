import type { LocalStreamingProvider } from '@/modules/streaming-providers/streaming-provider.types';

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
 * UI-oriented read model for the streaming-preferences settings screen.
 *
 * This is the full public contract for the settings UI. Catalogue
 * synchronization state, leases, and TMDB details are internal implementation
 * details and are intentionally not exposed here.
 */
export type StreamingPreferencesSettings = {
  countryCode: string | null;
  availableProviders: LocalStreamingProvider[];
  selectedProviders: SelectedStreamingProvider[];
  selectedProviderIds: string[];
};
