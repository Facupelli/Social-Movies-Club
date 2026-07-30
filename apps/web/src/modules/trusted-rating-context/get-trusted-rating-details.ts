import { toTrustedRater } from './get-trusted-rating-summaries';
import { TRUSTED_RATER_PREVIEW_LIMIT } from './trusted-rating-context.constants';
import { findTrustedRatingDetails } from './trusted-rating-context.pg';
import type {
  TrustedRatingDetailRow,
  TrustedRatingDetails,
} from './trusted-rating-context.types';

type DetailsRepository = (
  viewerUserId: string,
  mediaId: string
) => Promise<TrustedRatingDetailRow[]>;

export async function getTrustedRatingDetails(
  viewerUserId: string,
  mediaId: string,
  repository: DetailsRepository = findTrustedRatingDetails
): Promise<TrustedRatingDetails> {
  const rows = await repository(viewerUserId, mediaId);
  const firstRow = rows[0];
  const raters = rows.map(toTrustedRater);

  return {
    summary: {
      mediaId,
      ratingCount: firstRow?.ratingCount ?? 0,
      averageScore: firstRow ? Number(firstRow.averageScore) : null,
      previewRaters: raters.slice(0, TRUSTED_RATER_PREVIEW_LIMIT),
    },
    raters,
  };
}
