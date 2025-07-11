'use server';

import { headers } from 'next/headers';
import { FollowService } from '@/follows/follow.service';
import { auth } from '@/lib/auth';

export async function followUser(followedUserId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Unauthorized');
  }

  const followService = new FollowService();

  const result = await followService.followUser(
    session.user.id,
    followedUserId
  );
  return result;
}
