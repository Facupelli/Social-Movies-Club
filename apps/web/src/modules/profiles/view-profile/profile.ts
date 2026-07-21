import 'server-only';

import {
  getPublicProfileById,
  type PublicProfile,
} from '@/modules/profiles/profile.pg';

export async function getPublicProfile(
  profileUserId: string
): Promise<PublicProfile | null> {
  return await getPublicProfileById(profileUserId);
}
