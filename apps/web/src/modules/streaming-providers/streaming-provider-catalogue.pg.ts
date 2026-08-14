import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import {
  streamingProviderCatalogSync,
  streamingProviderRegions,
  streamingProviders,
} from '@/platform/database/postgres/schema';
import type { TmdbProvider } from '@/platform/tmdb/types/streaming';
import { upsertCanonicalStreamingProviders } from './canonical-streaming-providers.pg';
import type {
  LocalStreamingProvider,
  StreamingProviderCatalogueSnapshot,
} from './streaming-provider.types';
import { assertValidCountryCode } from './streaming-provider.validation';

/**
 * Atomically claims a country catalogue refresh when it has never been fetched
 * or is stale and no active lease exists.
 */
export async function claimStreamingProviderCatalogueSync(
  countryCode: string,
  now: Date,
  staleBefore: Date,
  leaseUntil: Date
): Promise<boolean> {
  assertValidCountryCode(countryCode);

  return await withDatabase(async (db) => {
    const { rows } = await db.execute<{ countryCode: string }>(sql`
      INSERT INTO ${streamingProviderCatalogSync}
        (country_code, refresh_lease_until)
      VALUES (${countryCode}, ${leaseUntil})
      ON CONFLICT (country_code) DO UPDATE
      SET refresh_lease_until = EXCLUDED.refresh_lease_until
      WHERE
        (${streamingProviderCatalogSync.fetchedAt} IS NULL
          OR ${streamingProviderCatalogSync.fetchedAt} < ${staleBefore})
        AND (${streamingProviderCatalogSync.refreshLeaseUntil} IS NULL
          OR ${streamingProviderCatalogSync.refreshLeaseUntil} <= ${now})
      RETURNING country_code AS "countryCode"
    `);

    return rows.length > 0;
  });
}

/**
 * Replaces both movie and TV regional provider snapshots in one transaction.
 * Readers observe either the previous complete country catalogue or the new
 * complete country catalogue, never a partially refreshed one.
 */
export async function persistStreamingProviderCatalogue(
  countryCode: string,
  movieProviders: TmdbProvider[],
  tvSeriesProviders: TmdbProvider[],
  fetchedAt: Date
): Promise<void> {
  assertValidCountryCode(countryCode);

  await withDatabase((db) =>
    db.transaction(async (tx) => {
      const providerIdByTmdbId = await upsertCanonicalStreamingProviders(tx, [
        ...movieProviders,
        ...tvSeriesProviders,
      ]);

      await tx.execute(sql`
        DELETE FROM ${streamingProviderRegions}
        WHERE country_code = ${countryCode}
      `);

      const regionValues = [
        ...movieProviders.map((provider) => ({
          provider,
          kind: 'movie' as const,
        })),
        ...tvSeriesProviders.map((provider) => ({
          provider,
          kind: 'tv_series' as const,
        })),
      ].map(({ provider, kind }) => {
        const providerId = providerIdByTmdbId.get(provider.tmdbProviderId);
        if (!providerId) {
          throw new Error(
            `Unable to resolve streaming provider id for TMDB provider ${provider.tmdbProviderId}`
          );
        }

        return sql`(${providerId}, ${countryCode}, ${kind}, ${provider.displayPriority})`;
      });

      if (regionValues.length > 0) {
        await tx.execute(sql`
          INSERT INTO ${streamingProviderRegions}
            (provider_id, country_code, kind, display_priority)
          VALUES ${sql.join(regionValues, sql`, `)}
        `);
      }

      await tx.execute(sql`
        INSERT INTO ${streamingProviderCatalogSync}
          (country_code, fetched_at)
        VALUES (${countryCode}, ${fetchedAt})
        ON CONFLICT (country_code) DO UPDATE
        SET
          fetched_at = EXCLUDED.fetched_at,
          refresh_lease_until = NULL
      `);
    })
  );
}

type CatalogueSnapshotRow = {
  providers: LocalStreamingProvider[];
  fetchedAt: Date | null;
};

/** Reads the unified local provider catalogue for one country. */
export async function getStreamingProviderCatalogueSnapshot(
  countryCode: string
): Promise<StreamingProviderCatalogueSnapshot> {
  assertValidCountryCode(countryCode);

  return await withDatabase(async (db) => {
    const { rows } = await db.execute<CatalogueSnapshotRow>(sql`
      WITH catalogue_providers AS (
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
        (
          SELECT fetched_at
          FROM ${streamingProviderCatalogSync}
          WHERE country_code = ${countryCode}
        ) AS "fetchedAt"
    `);

    const row = rows[0];
    return {
      providers: row?.providers ?? [],
      fetchedAt: row?.fetchedAt ?? null,
    };
  });
}
