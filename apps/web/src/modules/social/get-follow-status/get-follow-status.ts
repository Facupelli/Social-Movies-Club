import 'server-only';

import { getFollowStatus } from './follow-status.pg';

export async function getIsFollowingUser(
  viewerUserId: string,
  profileUserId: string
): Promise<boolean> {
  return await getFollowStatus(viewerUserId, profileUserId);
}
