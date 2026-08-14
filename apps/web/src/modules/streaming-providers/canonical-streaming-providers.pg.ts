import { sql } from 'drizzle-orm';
import type { PGDb } from '@/platform/database/postgres/db';
import { streamingProviders } from '@/platform/database/postgres/schema';

export type CanonicalStreamingProvider = {
  tmdbProviderId: number;
  name: string;
  logoPath: string | null;
};

type DatabaseTransaction = Parameters<Parameters<PGDb['transaction']>[0]>[0];

/**
 * Upserts canonical TMDB provider metadata and resolves the corresponding
 * QueVes provider IDs. The caller owns the surrounding snapshot transaction.
 */
export async function upsertCanonicalStreamingProviders(
  tx: DatabaseTransaction,
  providers: Iterable<CanonicalStreamingProvider>
): Promise<Map<number, string>> {
  const providersByTmdbId = new Map<number, CanonicalStreamingProvider>();

  for (const provider of providers) {
    providersByTmdbId.set(provider.tmdbProviderId, provider);
  }

  if (providersByTmdbId.size === 0) {
    return new Map();
  }

  const values = sql.join(
    [...providersByTmdbId.values()].map(
      (provider) =>
        sql`(${provider.tmdbProviderId}, ${provider.name}, ${provider.logoPath})`
    ),
    sql`, `
  );

  const { rows } = await tx.execute<{
    id: string;
    tmdb_provider_id: number;
  }>(sql`
    INSERT INTO ${streamingProviders}
      (tmdb_provider_id, name, logo_path)
    VALUES ${values}
    ON CONFLICT (tmdb_provider_id) DO UPDATE
    SET
      name = EXCLUDED.name,
      logo_path = EXCLUDED.logo_path,
      updated_at = now()
    RETURNING id, tmdb_provider_id
  `);

  return new Map(rows.map((row) => [row.tmdb_provider_id, row.id]));
}
