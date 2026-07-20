import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import { watchlist } from '@/platform/database/postgres/schema';

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
