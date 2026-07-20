import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import { users } from '@/platform/database/postgres/schema';

export class UsernamePgRepository {
  async update(userId: string, username: string): Promise<void> {
    return await withDatabase(async (db) => {
      await db.execute(sql`
        UPDATE ${users}
        SET username = ${username}
        WHERE id = ${userId}
      `);
    });
  }
}
