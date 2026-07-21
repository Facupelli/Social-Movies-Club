export interface WatchProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

export interface WatchProviderResult {
  link: string;
  buy?: WatchProvider[];
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
}

export interface WatchProviderResponse {
  data: WatchProviderResult | null;
}
