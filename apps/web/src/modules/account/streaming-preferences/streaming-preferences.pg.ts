import 'server-only';

import { asc, eq, sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import {
  streamingProviders,
  userProfiles,
  userStreamingProviders,
} from '@/platform/database/postgres/schema';
import type { SelectedStreamingProvider } from './streaming-preferences.types';

export type StreamingPreferencesBase = {
  countryCode: string | null;
  selectedProviders: SelectedStreamingProvider[];
};

/**
 * Reads the authoritative preference data without assembling the regional
 * catalogue. Selected providers are returned in a stable order independent of
 * regional membership.
 */
export async function findStreamingPreferencesBase(
  userId: string
): Promise<StreamingPreferencesBase> {
  return await withDatabase(async (db) => {
    const countryRows = await db
      .select({ countryCode: userProfiles.countryCode })
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    const selectedRows = await db
      .select({
        id: streamingProviders.id,
        tmdbProviderId: streamingProviders.tmdbProviderId,
        name: streamingProviders.name,
        logoPath: streamingProviders.logoPath,
      })
      .from(userStreamingProviders)
      .innerJoin(
        streamingProviders,
        eq(userStreamingProviders.providerId, streamingProviders.id)
      )
      .where(eq(userStreamingProviders.userId, userId))
      .orderBy(asc(streamingProviders.name), asc(streamingProviders.id));

    return {
      countryCode: countryRows[0]?.countryCode ?? null,
      selectedProviders: selectedRows,
    };
  });
}

export async function findUserStreamingCountry(
  userId: string
): Promise<string | null> {
  return await withDatabase(async (db) => {
    const rows = await db
      .select({ countryCode: userProfiles.countryCode })
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    return rows[0]?.countryCode ?? null;
  });
}

/**
 * Persists the user's country without touching their provider selections.
 */
export async function persistStreamingCountry(
  userId: string,
  countryCode: string
): Promise<string> {
  return await withDatabase(async (db) => {
    const { rows } = await db.execute<{ countryCode: string }>(sql`
      UPDATE ${userProfiles}
      SET country_code = ${countryCode}, updated_at = NOW()
      WHERE user_id = ${userId}
      RETURNING country_code AS "countryCode"
    `);

    const storedCountryCode = rows[0]?.countryCode;
    if (!storedCountryCode) {
      throw new Error('Unable to persist streaming country');
    }

    return storedCountryCode;
  });
}

export const UNKNOWN_STREAMING_PROVIDER_CODE = 'UNKNOWN_STREAMING_PROVIDER';

class UnknownStreamingProviderError extends Error {
  readonly code = UNKNOWN_STREAMING_PROVIDER_CODE;

  constructor() {
    super('Unknown streaming provider');
    this.name = 'UnknownStreamingProviderError';
  }
}

/**
 * Replaces the user's complete provider selection transactionally.
 *
 * Provider IDs are deduplicated defensively and every requested provider is
 * verified to exist before the previous selection is deleted, so an unknown
 * provider leaves the existing selection unchanged.
 */
export async function replaceStreamingProviders(
  userId: string,
  providerIds: string[]
): Promise<string[]> {
  const uniqueProviderIds = [...new Set(providerIds)];

  return await withDatabase((db) =>
    db.transaction(async (tx) => {
      if (uniqueProviderIds.length > 0) {
        const { rows } = await tx.execute<{ id: string }>(sql`
          SELECT id
          FROM ${streamingProviders}
          WHERE id IN (${sql.join(
            uniqueProviderIds.map((providerId) => sql`${providerId}::uuid`),
            sql`, `
          )})
        `);

        if (rows.length !== uniqueProviderIds.length) {
          throw new UnknownStreamingProviderError();
        }
      }

      await tx.execute(sql`
        DELETE FROM ${userStreamingProviders}
        WHERE user_id = ${userId}
      `);

      if (uniqueProviderIds.length > 0) {
        const values = sql.join(
          uniqueProviderIds.map(
            (providerId) => sql`(${userId}, ${providerId})`
          ),
          sql`, `
        );

        await tx.execute(sql`
          INSERT INTO ${userStreamingProviders} (user_id, provider_id)
          VALUES ${values}
        `);
      }

      return uniqueProviderIds;
    })
  );
}
