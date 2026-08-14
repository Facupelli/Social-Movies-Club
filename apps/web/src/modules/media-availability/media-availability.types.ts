import type { MediaKind } from '@/modules/media-catalog/media.type';

export type MediaAvailabilityState = 'missing' | 'fresh' | 'stale';

export type MediaAvailabilityRefreshResult =
  | { status: 'fresh' }
  | { status: 'refreshed'; countryCount: number; offerCount: number }
  | { status: 'skipped'; reason: 'lease-active' | 'cooldown' }
  | {
      status: 'unavailable';
      reason:
        | 'media-not-found'
        | 'tmdb-external-id-missing'
        | 'tmdb-external-id-invalid';
    };

export type MediaAvailabilityClaimResult =
  | { status: 'fresh' }
  | { status: 'claimed' }
  | { status: 'skipped'; reason: 'lease-active' | 'cooldown' }
  | { status: 'unavailable'; reason: 'media-not-found' };

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
