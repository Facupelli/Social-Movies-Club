import { toTrustedRater } from './get-trusted-rating-summaries';
import {
  findTimelineTrustedRatingContexts,
  type TimelineTrustedRatingEntry,
} from './trusted-rating-context.pg';
import type {
  TimelineTrustedRatingContextMap,
  TimelineTrustedRatingContextRow,
} from './trusted-rating-context.types';

export function timelineTrustedRatingContextKey({
  mediaId,
  actorId,
}: TimelineTrustedRatingEntry): string {
  return `${mediaId}:${actorId}`;
}

type TimelineContextRepository = (
  viewerUserId: string,
  entries: readonly TimelineTrustedRatingEntry[]
) => Promise<TimelineTrustedRatingContextRow[]>;

export async function getTimelineTrustedRatingContexts(
  viewerUserId: string,
  entries: readonly TimelineTrustedRatingEntry[],
  repository: TimelineContextRepository = findTimelineTrustedRatingContexts
): Promise<TimelineTrustedRatingContextMap> {
  const uniqueEntries = [
    ...new Map(
      entries.map((entry) => [timelineTrustedRatingContextKey(entry), entry])
    ).values(),
  ];

  if (uniqueEntries.length === 0) {
    return {};
  }

  const rows = await repository(viewerUserId, uniqueEntries);

  return Object.fromEntries(
    rows.map((row) => [
      timelineTrustedRatingContextKey(row),
      {
        summary: {
          mediaId: row.mediaId,
          ratingCount: row.ratingCount,
          averageScore:
            row.averageScore === null ? null : Number(row.averageScore),
          previewRaters: row.previewRaters.map(toTrustedRater),
        },
        otherPreviewRaters: row.otherPreviewRaters.map(toTrustedRater),
        otherRaterCount: row.otherRaterCount,
        actorIsCurrentlyTrusted: row.actorIsCurrentlyTrusted,
      },
    ])
  );
}
