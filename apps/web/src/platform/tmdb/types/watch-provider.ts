export interface WatchProvider {
  logo_path: string;
  provider_id: number; // Defaults to 0
  provider_name: string;
  display_priority: number; // Defaults to 0
}

export interface WatchProviderResult {
  link: string;
  buy: WatchProvider[];
  flatrate?: WatchProvider[];
  rent: WatchProvider[];
}

export interface WatchProviderApiResponse {
  id: number;
  results: {
    AR: WatchProviderResult;
  };
}
