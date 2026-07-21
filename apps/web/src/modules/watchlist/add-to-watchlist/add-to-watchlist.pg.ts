import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import { watchlist } from '@/platform/database/postgres/schema';

export async function addToWatchlist(
  userId: string,
  mediaId: string
): Promise<void> {
  await withDatabase(async (db) => {
    await db.execute(sql`
      INSERT INTO ${watchlist} (user_id, media_id)
      VALUES (${userId}, ${mediaId})
      ON CONFLICT (user_id, media_id) DO NOTHING
    `);
  });
}
