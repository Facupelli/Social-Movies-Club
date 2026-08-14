import type { MediaKind } from '@/modules/media-catalog/media.type';

export type StreamingProviderCatalogueSyncResult =
  | { status: 'fresh' }
  | { status: 'refreshed'; providerCount: number }
  | { status: 'skipped'; reason: 'lease-active' | 'cooldown' };

export type CatalogueSyncClaimResult =
  | { status: 'fresh' }
  | { status: 'claimed' }
  | { status: 'skipped'; reason: 'lease-active' | 'cooldown' };

export type LocalStreamingProvider = {
  id: string;
  tmdbProviderId: number;
  name: string;
  logoPath: string | null;
  supportedKinds: MediaKind[];
  displayPriority: number;
};

export type StreamingProviderCatalogueState = 'missing' | 'fresh' | 'stale';

export type StreamingProviderCatalogueSnapshot = {
  providers: LocalStreamingProvider[];
  movieFetchedAt: Date | null;
  tvSeriesFetchedAt: Date | null;
};
