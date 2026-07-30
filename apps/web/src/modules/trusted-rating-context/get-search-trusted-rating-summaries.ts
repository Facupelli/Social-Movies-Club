import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import { mediaExternalIds } from '@/platform/database/postgres/schema';
import { getMediaIdentityKey } from '@/modules/media-catalog/media-identity';
import type { MediaKind } from '@/modules/media-catalog/media.type';
import { toTmdbNamespace } from '@/platform/tmdb/tmdb-media-kind';
import { getTrustedRatingSummaries } from './get-trusted-rating-summaries';
import type { TrustedRatingSummary } from './trusted-rating-context.types';

export const MAX_SEARCH_TRUSTED_RATING_IDENTITIES = 50;

export type SearchMediaIdentity = {
  tmdbId: number;
  kind: MediaKind;
};

export type SearchTrustedRatingSummaryMap = Record<
  string,
  TrustedRatingSummary
>;

type LocalIdentity = SearchMediaIdentity & { mediaId: string };

type IdentityRepository = (
  identities: readonly SearchMediaIdentity[]
) => Promise<LocalIdentity[]>;

export async function findLocalMediaIdentities(
  identities: readonly SearchMediaIdentity[]
): Promise<LocalIdentity[]> {
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
      kind: row.namespace === 'tmdb:movie' ? 'movie' : 'tv_series',
    }));
  });
}

export async function getSearchTrustedRatingSummaries(
  viewerUserId: string,
  identities: readonly SearchMediaIdentity[],
  identityRepository: IdentityRepository = findLocalMediaIdentities
): Promise<SearchTrustedRatingSummaryMap> {
  const uniqueIdentities = [
    ...new Map(
      identities.map((identity) => [
        getMediaIdentityKey(identity.tmdbId, identity.kind),
        identity,
      ])
    ).values(),
  ];

  if (uniqueIdentities.length === 0) {
    return {};
  }

  const localIdentities = await identityRepository(uniqueIdentities);
  if (localIdentities.length === 0) {
    return {};
  }

  const summaries = await getTrustedRatingSummaries(
    viewerUserId,
    localIdentities.map(({ mediaId }) => mediaId)
  );

  return Object.fromEntries(
    localIdentities.map(({ kind, mediaId, tmdbId }) => [
      getMediaIdentityKey(tmdbId, kind),
      summaries[mediaId],
    ])
  );
}
