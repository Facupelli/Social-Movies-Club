import { type SQL, sql } from 'drizzle-orm';
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
  MediaAvailabilityClaimResult,
  MediaAvailabilityForCountry,
  MediaAvailabilityIdentity,
  MediaAvailabilityState,
} from './media-availability.types';
import {
  assertValidCountryCode,
  isValidCountryCode,
} from './media-availability.validation';

const MEDIA_AVAILABILITY_LOCK_NAMESPACE = 'media-availability';

type MediaAvailabilitySyncRow = {
  fetchedAt: Date | null;
  refreshLeaseUntil: Date | null;
  refreshNotBefore: Date | null;
};

function isFresh(fetchedAt: Date | null, staleBefore: Date): boolean {
  return fetchedAt !== null && fetchedAt >= staleBefore;
}

function isLeaseActive(leaseUntil: Date | null, now: Date): boolean {
  return leaseUntil !== null && leaseUntil > now;
}

function isCooldownActive(notBefore: Date | null, now: Date): boolean {
  return notBefore !== null && notBefore > now;
}

function computeAvailabilityState(
  fetchedAt: Date | null,
  now: Date
): MediaAvailabilityState {
  if (fetchedAt === null) {
    return 'missing';
  }

  const staleBefore = new Date(now.getTime() - MEDIA_AVAILABILITY_FRESHNESS_MS);
  return fetchedAt >= staleBefore ? 'fresh' : 'stale';
}

/**
 * Atomically inspects and, when allowed, claims the refresh lease for one
 * media item. The advisory lock serializes concurrent claims for the same
 * media; the persisted lease remains the durable guard once this transaction
 * commits.
 */
export async function claimMediaAvailabilityRefresh(
  mediaId: string,
  now: Date,
  staleBefore: Date,
  leaseUntil: Date
): Promise<MediaAvailabilityClaimResult> {
  return await withDatabase((db) =>
    db.transaction(async (tx) => {
      await tx.execute(
        sql`SELECT pg_advisory_xact_lock(hashtextextended(${`${MEDIA_AVAILABILITY_LOCK_NAMESPACE}:${mediaId}`}, 0))`
      );

      const existing = await tx.execute<MediaAvailabilitySyncRow>(sql`
        SELECT
          fetched_at AS "fetchedAt",
          refresh_lease_until AS "refreshLeaseUntil",
          refresh_not_before AS "refreshNotBefore"
        FROM ${mediaAvailabilitySync}
        WHERE media_id = ${mediaId}
        FOR UPDATE
      `);

      const row = existing.rows[0];

      if (row) {
        if (isFresh(row.fetchedAt, staleBefore)) {
          return { status: 'fresh' };
        }

        if (isLeaseActive(row.refreshLeaseUntil, now)) {
          return { status: 'skipped', reason: 'lease-active' };
        }

        if (isCooldownActive(row.refreshNotBefore, now)) {
          return { status: 'skipped', reason: 'cooldown' };
        }

        await tx.execute(sql`
          UPDATE ${mediaAvailabilitySync}
          SET refresh_lease_until = ${leaseUntil}
          WHERE media_id = ${mediaId}
        `);

        return { status: 'claimed' };
      }

      // The sync row has a foreign key to media, so a lease can only be
      // persisted for media that actually exists.
      const mediaExists = await tx.execute<{ id: string }>(sql`
        SELECT id FROM ${media} WHERE id = ${mediaId}
      `);

      if (mediaExists.rows.length === 0) {
        return { status: 'unavailable', reason: 'media-not-found' };
      }

      await tx.execute(sql`
        INSERT INTO ${mediaAvailabilitySync}
          (media_id, refresh_lease_until)
        VALUES (${mediaId}, ${leaseUntil})
      `);

      return { status: 'claimed' };
    })
  );
}

/**
 * Resolves the internal media kind and its matching TMDB external id. The
 * namespace is derived from the media kind in SQL so a mismatched namespace is
 * never consulted.
 */
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

/**
 * Replaces the complete local availability projection for one media item with
 * the snapshot returned by TMDB. Runs in a single transaction so readers
 * observe either the previous snapshot or the new snapshot, never a partial
 * one. Canonical providers are upserted but provider-region catalogue
 * membership is intentionally left untouched.
 */
export async function persistMediaAvailability(
  mediaId: string,
  availability: TmdbMediaAvailability,
  fetchedAt: Date
): Promise<{ countryCount: number; offerCount: number }> {
  return await withDatabase((db) =>
    db.transaction(async (tx) => {
      const providersByTmdbId = new Map<
        number,
        { name: string; logoPath: string | null }
      >();

      for (const country of availability.countries) {
        if (!isValidCountryCode(country.countryCode)) {
          continue;
        }

        for (const offer of country.offers) {
          if (!providersByTmdbId.has(offer.tmdbProviderId)) {
            providersByTmdbId.set(offer.tmdbProviderId, {
              name: offer.name,
              logoPath: offer.logoPath,
            });
          }
        }
      }

      let providerIdByTmdbId = new Map<number, string>();

      if (providersByTmdbId.size > 0) {
        const providerValues = sql.join(
          [...providersByTmdbId.entries()].map(
            ([tmdbProviderId, provider]) =>
              sql`(${tmdbProviderId}, ${provider.name}, ${provider.logoPath})`
          ),
          sql`, `
        );

        const inserted = await tx.execute<{
          id: string;
          tmdb_provider_id: number;
        }>(sql`
          INSERT INTO ${streamingProviders}
            (tmdb_provider_id, name, logo_path)
          VALUES ${providerValues}
          ON CONFLICT (tmdb_provider_id) DO UPDATE
          SET
            name = EXCLUDED.name,
            logo_path = EXCLUDED.logo_path,
            updated_at = now()
          RETURNING id, tmdb_provider_id
        `);

        providerIdByTmdbId = new Map(
          inserted.rows.map((row) => [row.tmdb_provider_id, row.id])
        );
      }

      await tx.execute(sql`
        DELETE FROM ${mediaAvailabilityOffers}
        WHERE media_id = ${mediaId}
      `);

      const offerValues: SQL[] = [];
      const seenOffers = new Set<string>();
      const countriesWithOffers = new Set<string>();

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
          countriesWithOffers.add(country.countryCode);

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
          refresh_lease_until = NULL,
          refresh_not_before = NULL
      `);

      return {
        countryCount: countriesWithOffers.size,
        offerCount: offerValues.length,
      };
    })
  );
}

/**
 * Records a rate-limit cooldown without touching the previously persisted
 * availability snapshot.
 */
export async function recordMediaAvailabilityCooldown(
  mediaId: string,
  notBefore: Date
): Promise<void> {
  await withDatabase((db) =>
    db.execute(sql`
      INSERT INTO ${mediaAvailabilitySync}
        (media_id, refresh_not_before)
      VALUES (${mediaId}, ${notBefore})
      ON CONFLICT (media_id) DO UPDATE
      SET
        refresh_lease_until = NULL,
        refresh_not_before = EXCLUDED.refresh_not_before
    `)
  );
}

/**
 * Releases the active lease after a non-rate-limit failure or an identity
 * resolution failure so a later interaction can retry. Existing availability
 * data is left untouched.
 */
export async function releaseMediaAvailabilityLease(
  mediaId: string
): Promise<void> {
  await withDatabase((db) =>
    db.execute(sql`
      UPDATE ${mediaAvailabilitySync}
      SET refresh_lease_until = NULL
      WHERE media_id = ${mediaId}
    `)
  );
}

type MediaAvailabilityOfferRow = {
  providerId: string;
  tmdbProviderId: number;
  providerName: string;
  logoPath: string | null;
  monetizationType: string;
};

/**
 * Reads the local availability projection for one media/country pair. This is
 * PostgreSQL-only and never triggers TMDB synchronization.
 */
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

        const fetchedAt = syncRows.rows[0]?.fetchedAt ?? null;

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
