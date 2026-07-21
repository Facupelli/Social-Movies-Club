import 'server-only';

import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import { users } from '@/platform/database/postgres/schema';

export async function persistUsername(
  userId: string,
  username: string
): Promise<void> {
  await withDatabase(async (db) => {
    await db.execute(sql`
      UPDATE ${users}
      SET username = ${username}
      WHERE id = ${userId}
    `);
  });
}
