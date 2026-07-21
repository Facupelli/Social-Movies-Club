import 'server-only';

import { getPublicProfileById } from '@/modules/profiles/profile.pg';

export async function getCurrentAccountProfile(userId: string) {
  return await getPublicProfileById(userId);
}
