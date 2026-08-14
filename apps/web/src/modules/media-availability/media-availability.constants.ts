/**
 * Application-level freshness and coordination policy for the local
 * media-availability projection.
 *
 * Availability is derived data, so these values intentionally live in the
 * application layer rather than in PostgreSQL: the policy should be easy to
 * change without a schema migration.
 */

/** Media availability is FRESH for this long after a successful fetch. */
export const MEDIA_AVAILABILITY_FRESHNESS_MS = 24 * 60 * 60 * 1000;

/** How long a claimed refresh lease stays active before it can be retried. */
export const MEDIA_AVAILABILITY_LEASE_MS = 60 * 1000;

/** Fallback cooldown when TMDB rate-limits us without a usable Retry-After. */
export const MEDIA_AVAILABILITY_COOLDOWN_FALLBACK_MS = 60 * 1000;
