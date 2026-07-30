import { sql } from 'drizzle-orm';
import type { MediaKind } from '@/modules/media-catalog/media.type';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import { mediaExternalIds } from '@/platform/database/postgres/schema';
import { toTmdbNamespace } from '@/platform/tmdb/tmdb-media-kind';
import type { SearchMediaIdentity } from './get-search-trusted-rating-summaries';

export type LocalMediaIdentity = SearchMediaIdentity & { mediaId: string };

export async function findLocalMediaIdentities(
  identities: readonly SearchMediaIdentity[]
): Promise<LocalMediaIdentity[]> {
  if (identities.length === 0) {
    return [];
  }

  return await withDatabase(async (db) => {
    const predicates = identities.map(
      ({ kind, tmdbId }) =>
        sql`(${mediaExternalIds.namespace} = ${toTmdbNamespace(kind)} AND ${mediaExternalIds.externalId} = ${String(tmdbId)})`
    );
    const { rows } = await db.execute<{
      mediaId: string;
      namespace: string;
      externalId: string;
    }>(sql`
      SELECT
        ${mediaExternalIds.mediaId} AS "mediaId",
        ${mediaExternalIds.namespace} AS namespace,
        ${mediaExternalIds.externalId} AS "externalId"
      FROM ${mediaExternalIds}
      WHERE ${sql.join(predicates, sql` OR `)}
    `);

    return rows.map((row) => ({
      mediaId: row.mediaId,
      tmdbId: Number(row.externalId),
      kind: (row.namespace === 'tmdb:movie'
        ? 'movie'
        : 'tv_series') as MediaKind,
    }));
  });
}
