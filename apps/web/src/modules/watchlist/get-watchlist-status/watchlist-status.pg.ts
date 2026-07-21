import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import { media, watchlist } from '@/platform/database/postgres/schema';
import type { WatchlistMediaIdentity } from '@/modules/watchlist/watchlist.types';

export async function isMediaInWatchlist(
  userId: string,
  mediaId: string
): Promise<boolean> {
  return await withDatabase(async (db) => {
    const { rows } = await db.execute<{ exists: boolean }>(sql`
      SELECT EXISTS (
        SELECT 1
        FROM ${watchlist}
        WHERE user_id = ${userId} AND media_id = ${mediaId}
      ) AS "exists"
    `);

    return rows[0]?.exists ?? false;
  });
}

export async function listWatchlistMediaIdentities(
  userId: string
): Promise<WatchlistMediaIdentity[]> {
  return await withDatabase(async (db) => {
    const { rows } = await db.execute<WatchlistMediaIdentity>(sql`
      SELECT
        m.tmdb_id AS "tmdbId",
        m.type
      FROM ${watchlist} AS w
      JOIN ${media} AS m ON m.id = w.media_id
      WHERE w.user_id = ${userId}
    `);

    return rows;
  });
}
