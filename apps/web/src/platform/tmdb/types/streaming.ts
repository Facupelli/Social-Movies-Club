import type { MediaKind } from '@/modules/media-catalog/media.type';

export interface TmdbProvider {
  tmdbProviderId: number;
  name: string;
  logoPath: string | null;
  displayPriority: number;
}

export interface TmdbProviderCatalogue {
  countryCode: string;
  kind: MediaKind;
  providers: TmdbProvider[];
}

export interface TmdbAvailabilityOffer {
  tmdbProviderId: number;
  name: string;
  logoPath: string | null;
  displayPriority: number;
  monetizationType: string;
}

export interface TmdbCountryAvailability {
  countryCode: string;
  link: string | null;
  offers: TmdbAvailabilityOffer[];
}

export interface TmdbMediaAvailability {
  countries: TmdbCountryAvailability[];
}
