import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import {
  type User,
  users,
} from '@/platform/database/postgres/schema';

export class ProfileSearchPgRepository {
  async search(query: string): Promise<User[]> {
    return await withDatabase(async (db) => {
      const usernameQuery = `%${query}%`;
      const { rows } = await db.execute<User>(sql<User>`
        SELECT id, name, image, username
        FROM users
        WHERE ${users.username} ILIKE ${usernameQuery}
      `);

      return rows;
    });
  }
}
