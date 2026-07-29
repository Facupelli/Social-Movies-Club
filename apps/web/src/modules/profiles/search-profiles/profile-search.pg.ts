import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import { userProfiles } from '@/platform/database/postgres/schema';
import type { ProfileSearchResult } from './profile-search.types';

export async function searchProfiles(
  query: string
): Promise<ProfileSearchResult[]> {
  return await withDatabase(async (db) => {
    const usernameQuery = `%${query}%`;
    const { rows } =
      await db.execute<ProfileSearchResult>(sql<ProfileSearchResult>`
        SELECT
          ${userProfiles.userId} AS id,
          ${userProfiles.displayName} AS name,
          ${userProfiles.avatarUrl} AS image,
          ${userProfiles.username} AS username
        FROM ${userProfiles}
        WHERE ${userProfiles.username} ILIKE ${usernameQuery}
      `);

    return rows;
  });
}
