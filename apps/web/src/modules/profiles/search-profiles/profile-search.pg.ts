import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import {
  type User,
  users,
} from '@/platform/database/postgres/schema';

export type ProfileSearchResult = Pick<
  User,
  'id' | 'name' | 'image' | 'username'
>;

export async function searchProfiles(
  query: string
): Promise<ProfileSearchResult[]> {
  return await withDatabase(async (db) => {
    const usernameQuery = `%${query}%`;
    const { rows } = await db.execute<ProfileSearchResult>(sql<ProfileSearchResult>`
      SELECT id, name, image, username
      FROM users
      WHERE ${users.username} ILIKE ${usernameQuery}
    `);

    return rows;
  });
}
