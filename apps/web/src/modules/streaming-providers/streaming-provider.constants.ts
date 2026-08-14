/**
 * Application-level freshness and coordination policy for the local
 * streaming-provider catalogue projection.
 *
 * These values intentionally live in the application layer, not in PostgreSQL:
 * provider catalogues change infrequently and the policy should be easy to
 * change without a schema migration.
 */

/** A catalogue is FRESH for this long after a successful fetch. */
export const STREAMING_PROVIDER_CATALOGUE_FRESHNESS_MS =
  7 * 24 * 60 * 60 * 1000;

/** How long a claimed refresh lease stays active before it can be retried. */
export const STREAMING_PROVIDER_CATALOGUE_LEASE_MS = 60 * 1000;

/** Fallback cooldown when TMDB rate-limits us without a usable Retry-After. */
export const STREAMING_PROVIDER_CATALOGUE_COOLDOWN_FALLBACK_MS = 60 * 1000;
