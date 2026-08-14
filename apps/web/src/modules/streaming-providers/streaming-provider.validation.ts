import type { MediaKind } from '@/modules/media-catalog/media.type';

const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;

/**
 * Validates a country code against the database invariant before it reaches
 * PostgreSQL. Invalid input is a programming/validation error, so we throw
 * instead of silently uppercasing or inventing a country.
 */
export function assertValidCountryCode(countryCode: string): void {
  if (!COUNTRY_CODE_PATTERN.test(countryCode)) {
    throw new Error(
      `Invalid country code: "${countryCode}". Expected two uppercase letters (ISO 3166-1 alpha-2).`
    );
  }
}

export function assertValidMediaKind(kind: string): asserts kind is MediaKind {
  if (kind !== 'movie' && kind !== 'tv_series') {
    throw new Error(
      `Invalid media kind: "${kind}". Expected "movie" or "tv_series".`
    );
  }
}
