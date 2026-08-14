import { sql } from 'drizzle-orm';
import type { MediaKind } from '@/modules/media-catalog/media.type';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import {
  streamingProviderCatalogSync,
  streamingProviderRegions,
  streamingProviders,
} from '@/platform/database/postgres/schema';
import type { TmdbProvider } from '@/platform/tmdb/types/streaming';
import type {
  CatalogueSyncClaimResult,
  LocalStreamingProvider,
  StreamingProviderCatalogueSnapshot,
} from './streaming-provider.types';
import { assertValidCountryCode } from './streaming-provider.validation';

const CATALOGUE_SYNC_LOCK_NAMESPACE = 'streaming-provider-catalogue';

type CatalogueSyncRow = {
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

/**
 * Atomically inspects and, when allowed, claims the refresh lease for one
 * country + kind catalogue. The advisory lock serializes concurrent claims for
 * the same catalogue; the persisted lease remains the durable guard once this
 * transaction commits.
 */
export async function claimStreamingProviderCatalogueSync(
  countryCode: string,
  kind: MediaKind,
  now: Date,
  staleBefore: Date,
  leaseUntil: Date
): Promise<CatalogueSyncClaimResult> {
  assertValidCountryCode(countryCode);

  return await withDatabase((db) =>
    db.transaction(async (tx) => {
      await tx.execute(
        sql`SELECT pg_advisory_xact_lock(hashtextextended(${`${CATALOGUE_SYNC_LOCK_NAMESPACE}:${countryCode}:${kind}`}, 0))`
      );

      const existing = await tx.execute<CatalogueSyncRow>(sql`
        SELECT
          fetched_at AS "fetchedAt",
          refresh_lease_until AS "refreshLeaseUntil",
          refresh_not_before AS "refreshNotBefore"
        FROM ${streamingProviderCatalogSync}
        WHERE country_code = ${countryCode} AND kind = ${kind}
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
          UPDATE ${streamingProviderCatalogSync}
          SET refresh_lease_until = ${leaseUntil}
          WHERE country_code = ${countryCode} AND kind = ${kind}
        `);

        return { status: 'claimed' };
      }

      await tx.execute(sql`
        INSERT INTO ${streamingProviderCatalogSync}
          (country_code, kind, refresh_lease_until)
        VALUES (${countryCode}, ${kind}, ${leaseUntil})
      `);

      return { status: 'claimed' };
    })
  );
}

/**
 * Replaces the complete local projection for one country + kind with the
 * providers returned by TMDB. Runs in a single transaction so readers observe
 * either the previous snapshot or the new snapshot, never a partial one.
 */
export async function persistStreamingProviderCatalogue(
  countryCode: string,
  kind: MediaKind,
  providers: TmdbProvider[],
  fetchedAt: Date
): Promise<void> {
  assertValidCountryCode(countryCode);

  await withDatabase((db) =>
    db.transaction(async (tx) => {
      let providerIdByTmdbId = new Map<number, string>();

      if (providers.length > 0) {
        const providerValues = sql.join(
          providers.map(
            (provider) =>
              sql`(${provider.tmdbProviderId}, ${provider.name}, ${provider.logoPath})`
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
        DELETE FROM ${streamingProviderRegions}
        WHERE country_code = ${countryCode} AND kind = ${kind}
      `);

      if (providers.length > 0) {
        const regionValues = sql.join(
          providers.map((provider) => {
            const providerId = providerIdByTmdbId.get(provider.tmdbProviderId);
            if (!providerId) {
              throw new Error(
                `Unable to resolve streaming provider id for TMDB provider ${provider.tmdbProviderId}`
              );
            }

            return sql`(${providerId}, ${countryCode}, ${kind}, ${provider.displayPriority})`;
          }),
          sql`, `
        );

        await tx.execute(sql`
          INSERT INTO ${streamingProviderRegions}
            (provider_id, country_code, kind, display_priority)
          VALUES ${regionValues}
        `);
      }

      await tx.execute(sql`
        INSERT INTO ${streamingProviderCatalogSync}
          (country_code, kind, fetched_at)
        VALUES (${countryCode}, ${kind}, ${fetchedAt})
        ON CONFLICT (country_code, kind) DO UPDATE
        SET
          fetched_at = EXCLUDED.fetched_at,
          refresh_lease_until = NULL,
          refresh_not_before = NULL
      `);
    })
  );
}

/**
 * Records a rate-limit cooldown without touching the previously persisted
 * catalogue snapshot.
 */
export async function recordStreamingProviderCatalogueCooldown(
  countryCode: string,
  kind: MediaKind,
  notBefore: Date
): Promise<void> {
  assertValidCountryCode(countryCode);

  await withDatabase((db) =>
    db.execute(sql`
      INSERT INTO ${streamingProviderCatalogSync}
        (country_code, kind, refresh_not_before)
      VALUES (${countryCode}, ${kind}, ${notBefore})
      ON CONFLICT (country_code, kind) DO UPDATE
      SET
        refresh_lease_until = NULL,
        refresh_not_before = EXCLUDED.refresh_not_before
    `)
  );
}

/**
 * Releases the active lease after a non-rate-limit failure so a later
 * interaction can retry. Existing catalogue data is left untouched.
 */
export async function releaseStreamingProviderCatalogueLease(
  countryCode: string,
  kind: MediaKind
): Promise<void> {
  assertValidCountryCode(countryCode);

  await withDatabase((db) =>
    db.execute(sql`
      UPDATE ${streamingProviderCatalogSync}
      SET refresh_lease_until = NULL
      WHERE country_code = ${countryCode} AND kind = ${kind}
    `)
  );
}

type CatalogueSnapshotRow = {
  providers: LocalStreamingProvider[];
  movieFetchedAt: Date | null;
  tvSeriesFetchedAt: Date | null;
};

/**
 * Reads the unified local provider catalogue for one country together with the
 * persisted sync timestamps for its movie and tv_series catalogues.
 *
 * This is a single PostgreSQL round trip. The provider list preserves the
 * previous regional catalogue semantics (one canonical provider at most once,
 * merged movie/TV support, minimum regional display priority, and deterministic
 * ordering), while the two sync timestamps come from
 * streaming_provider_catalog_sync. A missing sync row or NULL fetched_at
 * produces a NULL timestamp.
 *
 * PostgreSQL-only: never acquires a lease or calls TMDB.
 */
export async function getStreamingProviderCatalogueSnapshot(
  countryCode: string
): Promise<StreamingProviderCatalogueSnapshot> {
  assertValidCountryCode(countryCode);

  return await withDatabase(async (db) => {
    const { rows } = await db.execute<CatalogueSnapshotRow>(sql`
      WITH catalogue_sync AS (
        SELECT
          MAX(fetched_at) FILTER (WHERE kind = 'movie') AS "movieFetchedAt",
          MAX(fetched_at) FILTER (WHERE kind = 'tv_series') AS "tvSeriesFetchedAt"
        FROM ${streamingProviderCatalogSync}
        WHERE country_code = ${countryCode}
      ),
      catalogue_providers AS (
        SELECT
          sp.id,
          sp.tmdb_provider_id AS "tmdbProviderId",
          sp.name,
          sp.logo_path AS "logoPath",
          array_agg(DISTINCT spr.kind::text ORDER BY spr.kind::text) AS "supportedKinds",
          MIN(spr.display_priority) AS "displayPriority"
        FROM ${streamingProviderRegions} spr
        INNER JOIN ${streamingProviders} sp ON sp.id = spr.provider_id
        WHERE spr.country_code = ${countryCode}
        GROUP BY sp.id, sp.tmdb_provider_id, sp.name, sp.logo_path
      )
      SELECT
        COALESCE(
          (
            SELECT JSONB_AGG(
              JSONB_BUILD_OBJECT(
                'id', cp.id,
                'tmdbProviderId', cp."tmdbProviderId",
                'name', cp.name,
                'logoPath', cp."logoPath",
                'supportedKinds', cp."supportedKinds",
                'displayPriority', cp."displayPriority"
              )
              ORDER BY cp."displayPriority" ASC, cp.name ASC, cp.id ASC
            )
            FROM catalogue_providers cp
          ),
          '[]'::jsonb
        ) AS "providers",
        (SELECT "movieFetchedAt" FROM catalogue_sync) AS "movieFetchedAt",
        (SELECT "tvSeriesFetchedAt" FROM catalogue_sync) AS "tvSeriesFetchedAt"
    `);

    const row = rows[0];

    return {
      providers: row?.providers ?? [],
      movieFetchedAt: row?.movieFetchedAt ?? null,
      tvSeriesFetchedAt: row?.tvSeriesFetchedAt ?? null,
    };
  });
}
