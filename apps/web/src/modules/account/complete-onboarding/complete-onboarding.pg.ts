import 'server-only';

import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import { userProfiles } from '@/platform/database/postgres/schema';

export async function persistOnboardingCompleted(
  userId: string
): Promise<void> {
  await withDatabase(async (db) => {
    await db.execute(sql`
      UPDATE ${userProfiles}
      SET onboarding_completed_at = NOW()
      WHERE user_id = ${userId}
    `);
  });
}
