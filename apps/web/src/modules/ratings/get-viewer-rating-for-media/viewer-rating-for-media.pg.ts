import { and, eq } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import { ratings } from '@/platform/database/postgres/schema';
import type { ViewerMediaRating } from './viewer-rating-for-media.types';

export async function findViewerRatingForMedia(
  viewerUserId: string,
  mediaId: string
): Promise<ViewerMediaRating | null> {
  return await withDatabase(async (db) => {
    const rows = await db
      .select({
        score: ratings.score,
        watchedDate: ratings.watchedDate,
        ratedAt: ratings.createdAt,
      })
      .from(ratings)
      .where(
        and(eq(ratings.userId, viewerUserId), eq(ratings.mediaId, mediaId))
      )
      .limit(1);
    const row = rows[0];

    return row
      ? {
          score: row.score,
          watchedDate: row.watchedDate,
          ratedAt: row.ratedAt.toISOString(),
        }
      : null;
  });
}
