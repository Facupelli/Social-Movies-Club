import 'server-only';

import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import { media, ratings } from '@/platform/database/postgres/schema';

type AnnualMovieCounts = {
  year: number;
  months: { month: number; count: number }[];
};

export async function findAnnualMovieCounts(
  profileUserId: string
): Promise<AnnualMovieCounts> {
  return await withDatabase(async (db) => {
    const { rows } = await db.execute<AnnualMovieCounts>(sql`
      SELECT
        EXTRACT(YEAR FROM CURRENT_DATE)::integer AS year,
        COALESCE(JSON_AGG(monthly_counts), '[]'::json) AS months
      FROM (
        SELECT
          EXTRACT(MONTH FROM r.watched_date)::integer AS month,
          COUNT(*)::integer AS count
        FROM ${ratings} r
        JOIN ${media} m ON m.id = r.media_id
        WHERE r.user_id = ${profileUserId}
          AND m.kind = 'movie'
          AND r.watched_date >= DATE_TRUNC('year', CURRENT_DATE)::date
          AND r.watched_date < (DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year')::date
        GROUP BY 1
      ) monthly_counts
    `);

    const summary = rows[0];
    if (!summary) {
      throw new Error('Annual viewing activity query returned no summary');
    }

    return summary;
  });
}
