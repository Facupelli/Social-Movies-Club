import { type SQL, sql } from 'drizzle-orm';
import { upsertCanonicalStreamingProviders } from '@/modules/streaming-providers/canonical-streaming-providers.pg';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import {
  media,
  mediaAvailabilityOffers,
  mediaAvailabilitySync,
  mediaExternalIds,
  streamingProviders,
} from '@/platform/database/postgres/schema';
import { tmdbNamespaceForKindSql } from '@/platform/tmdb/tmdb-media-kind';
import type { TmdbMediaAvailability } from '@/platform/tmdb/types/streaming';
import { MEDIA_AVAILABILITY_FRESHNESS_MS } from './media-availability.constants';
import type {
  MediaAvailabilityForCountry,
  MediaAvailabilityIdentity,
  MediaAvailabilityState,
} from './media-availability.types';
import {
  assertValidCountryCode,
  isValidCountryCode,
} from './media-availability.validation';

function computeAvailabilityState(
  fetchedAt: Date | null,
  now: Date
): MediaAvailabilityState {
  if (fetchedAt === null) {
    return 'missing';
  }

  return fetchedAt.getTime() >= now.getTime() - MEDIA_AVAILABILITY_FRESHNESS_MS
    ? 'fresh'
    : 'stale';
}

/**
 * Atomically claims a media refresh when it has never been fetched or is stale
 * and no active lease exists. A missing media row is not claimable.
 */
export async function claimMediaAvailabilityRefresh(
  mediaId: string,
  now: Date,
  staleBefore: Date,
  leaseUntil: Date
): Promise<boolean> {
  return await withDatabase(async (db) => {
    const { rows } = await db.execute<{ mediaId: string }>(sql`
      INSERT INTO ${mediaAvailabilitySync}
        (media_id, refresh_lease_until)
      SELECT id, ${leaseUntil}
      FROM ${media}
      WHERE id = ${mediaId}
      ON CONFLICT (media_id) DO UPDATE
      SET refresh_lease_until = EXCLUDED.refresh_lease_until
      WHERE
        (${mediaAvailabilitySync.fetchedAt} IS NULL
          OR ${mediaAvailabilitySync.fetchedAt} < ${staleBefore})
        AND (${mediaAvailabilitySync.refreshLeaseUntil} IS NULL
          OR ${mediaAvailabilitySync.refreshLeaseUntil} <= ${now})
      RETURNING media_id AS "mediaId"
    `);

    return rows.length > 0;
  });
}

/** Resolves the internal media kind and matching TMDB external ID. */
export async function getMediaAvailabilityIdentity(
  mediaId: string
): Promise<MediaAvailabilityIdentity | undefined> {
  return await withDatabase(async (db) => {
    const { rows } = await db.execute<MediaAvailabilityIdentity>(sql`
      SELECT
        m.kind,
        mei.external_id AS "externalId"
      FROM ${media} m
      LEFT JOIN ${mediaExternalIds} mei
        ON mei.media_id = m.id
       AND mei.namespace = ${tmdbNamespaceForKindSql(sql.raw('m.kind'))}
      WHERE m.id = ${mediaId}
    `);

    return rows[0];
  });
}

/** Replaces the complete local availability snapshot for one media item. */
export async function persistMediaAvailability(
  mediaId: string,
  availability: TmdbMediaAvailability,
  fetchedAt: Date
): Promise<void> {
  await withDatabase((db) =>
    db.transaction(async (tx) => {
      const providers = availability.countries.flatMap((country) =>
        isValidCountryCode(country.countryCode) ? country.offers : []
      );
      const providerIdByTmdbId = await upsertCanonicalStreamingProviders(
        tx,
        providers
      );

      await tx.execute(sql`
        DELETE FROM ${mediaAvailabilityOffers}
        WHERE media_id = ${mediaId}
      `);

      const offerValues: SQL[] = [];
      const seenOffers = new Set<string>();

      for (const country of availability.countries) {
        if (!isValidCountryCode(country.countryCode)) {
          continue;
        }

        for (const offer of country.offers) {
          const providerId = providerIdByTmdbId.get(offer.tmdbProviderId);
          if (!providerId) {
            throw new Error(
              `Unable to resolve streaming provider id for TMDB provider ${offer.tmdbProviderId}`
            );
          }

          const dedupeKey = `${country.countryCode}:${providerId}:${offer.monetizationType}`;
          if (seenOffers.has(dedupeKey)) {
            continue;
          }
          seenOffers.add(dedupeKey);

          offerValues.push(
            sql`(${mediaId}, ${country.countryCode}, ${providerId}, ${offer.monetizationType})`
          );
        }
      }

      if (offerValues.length > 0) {
        await tx.execute(sql`
          INSERT INTO ${mediaAvailabilityOffers}
            (media_id, country_code, provider_id, monetization_type)
          VALUES ${sql.join(offerValues, sql`, `)}
        `);
      }

      await tx.execute(sql`
        INSERT INTO ${mediaAvailabilitySync}
          (media_id, fetched_at)
        VALUES (${mediaId}, ${fetchedAt})
        ON CONFLICT (media_id) DO UPDATE
        SET
          fetched_at = EXCLUDED.fetched_at,
          refresh_lease_until = NULL
      `);
    })
  );
}

type MediaAvailabilityOfferRow = {
  providerId: string;
  tmdbProviderId: number;
  providerName: string;
  logoPath: string | null;
  monetizationType: string;
};

/** Reads the local availability projection for one media/country pair. */
export async function getMediaAvailabilityForCountry(
  mediaId: string,
  countryCode: string
): Promise<MediaAvailabilityForCountry> {
  assertValidCountryCode(countryCode);

  return await withDatabase((db) =>
    db.transaction(
      async (tx) => {
        const syncRows = await tx.execute<{ fetchedAt: Date | null }>(sql`
          SELECT fetched_at AS "fetchedAt"
          FROM ${mediaAvailabilitySync}
          WHERE media_id = ${mediaId}
        `);

        const { rows } = await tx.execute<MediaAvailabilityOfferRow>(sql`
          SELECT
            sp.id AS "providerId",
            sp.tmdb_provider_id AS "tmdbProviderId",
            sp.name AS "providerName",
            sp.logo_path AS "logoPath",
            mao.monetization_type AS "monetizationType"
          FROM ${mediaAvailabilityOffers} mao
          INNER JOIN ${streamingProviders} sp ON sp.id = mao.provider_id
          WHERE mao.media_id = ${mediaId}
            AND mao.country_code = ${countryCode}
          ORDER BY sp.tmdb_provider_id ASC, mao.monetization_type ASC
        `);

        const fetchedAt = syncRows.rows[0]?.fetchedAt ?? null;
        return {
          state: computeAvailabilityState(fetchedAt, new Date()),
          fetchedAt,
          offers: rows,
        };
      },
      { isolationLevel: 'repeatable read' }
    )
  );
}
