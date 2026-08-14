import type { MediaKind } from '@/modules/media-catalog/media.type';

export type LocalStreamingProvider = {
  id: string;
  tmdbProviderId: number;
  name: string;
  logoPath: string | null;
  supportedKinds: MediaKind[];
  displayPriority: number;
};

export type StreamingProviderCatalogueSnapshot = {
  providers: LocalStreamingProvider[];
  fetchedAt: Date | null;
};
