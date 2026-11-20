import 'server-only';

import { eq } from 'drizzle-orm';
import { getPublicProfileById } from '@/modules/profiles/profile.pg';
import { withDatabase } from '@/platform/database/postgres/db-utils';
import { userProfiles } from '@/platform/database/postgres/schema';

export async function getCurrentAccountProfile(userId: string) {
  return await getPublicProfileById(userId);
}

export async function findAccountCountry(
  userId: string
): Promise<string | null> {
  return await withDatabase(async (db) => {
    const [profile] = await db
      .select({ countryCode: userProfiles.countryCode })
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    return profile?.countryCode ?? null;
  });
}
