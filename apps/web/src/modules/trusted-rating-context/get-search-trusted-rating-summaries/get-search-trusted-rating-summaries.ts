import type { MediaKind } from '@/modules/media-catalog/media.type';
import { getMediaIdentityKey } from '@/modules/media-catalog/media-identity';
import { getTrustedRatingSummaries } from '../get-trusted-rating-summaries/get-trusted-rating-summaries';
import type { TrustedRatingSummary } from '../trusted-rating-context.types';
import {
  findLocalMediaIdentities,
  type LocalMediaIdentity,
} from './get-search-trusted-rating-summaries.pg';

export const MAX_SEARCH_TRUSTED_RATING_IDENTITIES = 50;

export type SearchMediaIdentity = {
  tmdbId: number;
  kind: MediaKind;
};

export type SearchTrustedRatingSummaryMap = Record<
  string,
  TrustedRatingSummary
>;

type IdentityRepository = (
  identities: readonly SearchMediaIdentity[]
) => Promise<LocalMediaIdentity[]>;

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
