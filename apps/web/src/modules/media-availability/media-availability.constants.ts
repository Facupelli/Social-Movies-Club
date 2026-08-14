/** Media availability is fresh for 24 hours after a successful fetch. */
export const MEDIA_AVAILABILITY_FRESHNESS_MS = 24 * 60 * 60 * 1000;

/** How long a claimed refresh lease stays active before it can be retried. */
export const MEDIA_AVAILABILITY_LEASE_MS = 60 * 1000;
