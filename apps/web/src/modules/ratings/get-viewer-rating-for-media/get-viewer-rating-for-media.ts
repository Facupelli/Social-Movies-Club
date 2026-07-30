import { findViewerRatingForMedia } from './viewer-rating-for-media.pg';
import type { ViewerMediaRating } from './viewer-rating-for-media.types';

type ViewerRatingRepository = (
  viewerUserId: string,
  mediaId: string
) => Promise<ViewerMediaRating | null>;

export async function getViewerRatingForMedia(
  viewerUserId: string,
  mediaId: string,
  repository: ViewerRatingRepository = findViewerRatingForMedia
): Promise<ViewerMediaRating | null> {
  return await repository(viewerUserId, mediaId);
}
