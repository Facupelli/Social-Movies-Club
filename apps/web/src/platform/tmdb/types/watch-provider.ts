import type { WatchProviderResult } from '@/modules/media-catalog/get-watch-providers/watch-provider.types';

export interface WatchProviderApiResponse {
  id: number;
  results: Record<string, WatchProviderResult | undefined>;
}
