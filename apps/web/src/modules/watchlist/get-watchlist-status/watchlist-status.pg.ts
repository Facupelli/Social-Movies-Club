import { sql } from 'drizzle-orm';
import type { WatchlistMediaIdentity } from '@/modules/watchlist/watchlist.types';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import { media, watchlist } from '@/platform/database/postgres/schema';
import { tmdbNamespaceForKindSql } from '@/platform/tmdb/tmdb-media-kind';

export async function listWatchlistMediaIdentities(
  userId: string
): Promise<WatchlistMediaIdentity[]> {
  return await withDatabase(async (db) => {
    const { rows } = await db.execute<WatchlistMediaIdentity>(sql`
      SELECT
        mei.external_id::integer AS "tmdbId",
        m.kind
      FROM ${watchlist} AS w
      JOIN ${media} AS m ON m.id = w.media_id
      JOIN media_external_ids AS mei
        ON mei.media_id = m.id
        AND mei.namespace = ${tmdbNamespaceForKindSql(sql.raw('m.kind'))}
      WHERE w.user_id = ${userId}
    `);

    return rows;
  });
}
