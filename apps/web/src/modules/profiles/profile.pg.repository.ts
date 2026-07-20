import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import {
  type User,
  users,
} from '@/platform/database/postgres/schema';

export class ProfilePgRepository {
  async getById(userId: string): Promise<User> {
    return await withDatabase(async (db) => {
      const query = sql<User>`
        SELECT * FROM users WHERE ${users.id} = ${userId}
      `;

      const { rows } = await db.execute<User>(query);
      return rows[0];
    });
  }
}
