const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;
const POSITIVE_INTEGER_PATTERN = /^\d+$/;

/**
 * Validates a country code against the database invariant before it reaches
 * PostgreSQL. Invalid input is a programming/validation error, so we throw
 * instead of silently uppercasing or inventing a country.
 */
export function assertValidCountryCode(countryCode: string): void {
  if (!isValidCountryCode(countryCode)) {
    throw new Error(
      `Invalid country code: "${countryCode}". Expected two uppercase letters (ISO 3166-1 alpha-2).`
    );
  }
}

export function isValidCountryCode(countryCode: string): boolean {
  return COUNTRY_CODE_PATTERN.test(countryCode);
}

/**
 * Parses a persisted TMDB external id into a usable positive integer. Returns
 * null when the value is not a positive, safe integer and therefore must not
 * be sent to TMDB.
 */
export function parsePositiveTmdbId(value: string): number | null {
  if (!POSITIVE_INTEGER_PATTERN.test(value)) {
    return null;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}
