import 'server-only';

import { listFollowingUsers as listFollowingUsersRepository } from './following.pg';
import type { FollowingUser } from './following.types';

export type ListFollowingUsersInput = {
  profileUserId: string;
  viewerUserId: string;
};

export async function listFollowingUsers({
  profileUserId,
  viewerUserId,
}: ListFollowingUsersInput): Promise<FollowingUser[]> {
  return await listFollowingUsersRepository(profileUserId, viewerUserId);
}
