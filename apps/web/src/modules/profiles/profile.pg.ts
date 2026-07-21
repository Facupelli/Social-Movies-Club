import 'server-only';

import { sql } from 'drizzle-orm';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import { type User, users } from '@/platform/database/postgres/schema';

export type PublicProfile = Pick<User, 'id' | 'name' | 'image' | 'username'>;

export async function getProfileById(userId: string): Promise<User | null> {
  return await withDatabase(async (db) => {
    const query = sql<User>`
      SELECT * FROM users WHERE ${users.id} = ${userId}
    `;

    const { rows } = await db.execute<User>(query);
    return rows[0] ?? null;
  });
}

export async function getPublicProfileById(
  userId: string
): Promise<PublicProfile | null> {
  return await withDatabase(async (db) => {
    const query = sql<PublicProfile>`
      SELECT id, name, image, username
      FROM users
      WHERE ${users.id} = ${userId}
    `;

    const { rows } = await db.execute<PublicProfile>(query);
    return rows[0] ?? null;
  });
}
