import { findTrustedRatingSummaries } from './trusted-rating-context.pg';
import type {
  TrustedRater,
  TrustedRaterRow,
  TrustedRatingRow,
  TrustedRatingSummary,
  TrustedRatingSummaryMap,
} from './trusted-rating-context.types';

type SummaryRepository = (
  viewerUserId: string,
  mediaIds: readonly string[]
) => Promise<TrustedRatingRow[]>;

function toDateString(value: Date | string): string {
  return value instanceof Date ? value.toISOString().slice(0, 10) : value;
}

function toIsoString(value: Date | string): string {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

export function toTrustedRater(row: TrustedRaterRow): TrustedRater {
  return {
    userId: row.userId,
    displayName: row.displayName,
    username: row.username,
    avatarUrl: row.avatarUrl,
    score: row.score,
    watchedDate: toDateString(row.watchedDate),
    ratedAt: toIsoString(row.ratedAt),
  };
}

function emptySummary(mediaId: string): TrustedRatingSummary {
  return {
    mediaId,
    ratingCount: 0,
    averageScore: null,
    previewRaters: [],
  };
}

export async function getTrustedRatingSummaries(
  viewerUserId: string,
  mediaIds: readonly string[],
  repository: SummaryRepository = findTrustedRatingSummaries
): Promise<TrustedRatingSummaryMap> {
  const uniqueMediaIds = [...new Set(mediaIds)];
  const summaries = Object.fromEntries(
    uniqueMediaIds.map((mediaId) => [mediaId, emptySummary(mediaId)])
  );

  if (uniqueMediaIds.length === 0) {
    return summaries;
  }

  const rows = await repository(viewerUserId, uniqueMediaIds);
  for (const row of rows) {
    summaries[row.mediaId] = {
      mediaId: row.mediaId,
      ratingCount: row.ratingCount,
      averageScore: Number(row.averageScore),
      previewRaters: row.previewRaters.map(toTrustedRater),
    };
  }

  return summaries;
}
