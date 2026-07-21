import { sql } from 'drizzle-orm';
import type { MediaType } from '@/modules/media-catalog/media.type';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import { media, watchlist } from '@/platform/database/postgres/schema';

export async function removeFromWatchlistByIdentity(
  userId: string,
  tmdbId: number,
  type: MediaType
): Promise<void> {
  await withDatabase(async (db) => {
    await db.execute(sql`
      DELETE FROM ${watchlist} AS w
      USING ${media} AS m
      WHERE w.user_id = ${userId}
        AND w.media_id = m.id
        AND m.tmdb_id = ${tmdbId}
        AND m.type = ${type}
    `);
  });
}

export async function removeFromWatchlist(
  userId: string,
  mediaId: string
): Promise<void> {
  await withDatabase(async (db) => {
    await db.execute(sql`
      DELETE FROM ${watchlist}
      WHERE user_id = ${userId} AND media_id = ${mediaId}
    `);
  });
}
