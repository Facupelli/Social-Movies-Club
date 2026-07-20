import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import { ratings } from '@/platform/database/postgres/schema';

export type PersistedRating = {
  id: string;
  user_id: string;
  media_id: string;
  score: number;
  created_at: Date;
};

export async function upsertRating(
  userId: string,
  mediaId: string | bigint,
  score: number,
  watchedDate: string
): Promise<PersistedRating> {
  return await withDatabase(async (db) => {
    const { rows } = await db.execute<PersistedRating>(sql`
      INSERT INTO ${ratings}
        (user_id, media_id, score, watched_date, created_at)
      VALUES
        (${userId}, ${mediaId}, ${score}, ${watchedDate}, now())
      ON CONFLICT (user_id, media_id)
      DO UPDATE SET
        score = EXCLUDED.score,
        created_at = now()
      RETURNING id, user_id, media_id, score, created_at
    `);

    return rows[0];
  });
}
