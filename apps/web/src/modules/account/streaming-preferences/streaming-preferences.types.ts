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
 * synchronization state (fresh/stale/missing, leases, cooldowns, TMDB) is an
 * internal implementation detail and is intentionally not exposed here.
 */
export type StreamingPreferencesSettings = {
  countryCode: string | null;
  availableProviders: LocalStreamingProvider[];
  selectedProviders: SelectedStreamingProvider[];
  selectedProviderIds: string[];
};
