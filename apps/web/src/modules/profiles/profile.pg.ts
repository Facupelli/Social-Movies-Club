import 'server-only';

import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import { userProfiles } from '@/platform/database/postgres/schema';

export type PublicProfile = {
  id: string;
  name: string;
  image: string | null;
  username: string | null;
};

export async function getPublicProfileById(
  userId: string
): Promise<PublicProfile | null> {
  return await withDatabase(async (db) => {
    const query = sql<PublicProfile>`
      SELECT
        ${userProfiles.userId} AS id,
        ${userProfiles.displayName} AS name,
        ${userProfiles.avatarUrl} AS image,
        ${userProfiles.username} AS username
      FROM ${userProfiles}
      WHERE ${userProfiles.userId} = ${userId}
    `;

    const { rows } = await db.execute<PublicProfile>(query);
    return rows[0] ?? null;
  });
}
