import { sql } from 'drizzle-orm';
import {
  mediaTypeToTmdbNamespace,
  type MediaType,
} from '@/modules/media-catalog/media.type';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import {
  mediaExternalIds,
  watchlist,
} from '@/platform/database/postgres/schema';

export async function removeFromWatchlistByIdentity(
  userId: string,
  tmdbId: number,
  type: MediaType
): Promise<void> {
  await withDatabase(async (db) => {
    await db.execute(sql`
      DELETE FROM ${watchlist} AS w
      USING ${mediaExternalIds} AS mei
      WHERE w.user_id = ${userId}
        AND w.media_id = mei.media_id
        AND mei.namespace = ${mediaTypeToTmdbNamespace(type)}
        AND mei.external_id = ${String(tmdbId)}
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
