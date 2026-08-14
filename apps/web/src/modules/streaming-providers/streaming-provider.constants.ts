/** A catalogue is fresh for seven days after a successful fetch. */
export const STREAMING_PROVIDER_CATALOGUE_FRESHNESS_MS =
  7 * 24 * 60 * 60 * 1000;

/** How long a claimed refresh lease stays active before it can be retried. */
export const STREAMING_PROVIDER_CATALOGUE_LEASE_MS = 60 * 1000;
