import type { MediaKind } from '@/modules/media-catalog/media.type';

export type MediaAvailabilityState = 'missing' | 'fresh' | 'stale';

export type MediaAvailabilityIdentity = {
  kind: MediaKind;
  externalId: string | null;
};

export type MediaAvailabilityOffer = {
  providerId: string;
  tmdbProviderId: number;
  providerName: string;
  logoPath: string | null;
  monetizationType: string;
};

export type MediaAvailabilityForCountry = {
  state: MediaAvailabilityState;
  fetchedAt: Date | null;
  offers: MediaAvailabilityOffer[];
};
