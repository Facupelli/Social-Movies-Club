import { type SQL, sql } from 'drizzle-orm';
import { mediaAvailabilityOffers } from '@/platform/database/postgres/schema';
import { MEDIA_AVAILABILITY_FILTER_MAX_AGE_MS } from './media-availability.constants';

export type SubscriptionAvailabilityFilter = {
  countryCode: string;
  providerIds: readonly [string, ...string[]];
};

export function subscriptionAvailabilityStatusSql({
  mediaId,
  fetchedAt,
  filter,
}: {
  mediaId: SQL;
  fetchedAt: SQL;
  filter: SubscriptionAvailabilityFilter;
}): SQL {
  const cutoff = new Date(Date.now() - MEDIA_AVAILABILITY_FILTER_MAX_AGE_MS);
  const providerIds = sql.join(
    filter.providerIds.map((id) => sql`${id}::uuid`),
    sql`, `
  );

  return sql`CASE
    WHEN ${fetchedAt} IS NULL OR ${fetchedAt} < ${cutoff}::timestamptz
      THEN 'unknown'
    WHEN EXISTS (
      SELECT 1 FROM ${mediaAvailabilityOffers} offer
      WHERE offer.media_id = ${mediaId}
        AND offer.country_code = ${filter.countryCode}
        AND offer.provider_id IN (${providerIds})
        AND offer.monetization_type = 'flatrate'
    ) THEN 'match'
    ELSE 'no-match'
  END`;
}
