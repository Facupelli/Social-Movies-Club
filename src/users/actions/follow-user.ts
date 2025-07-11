'use server';

import { FollowService } from '@/follows/follow.service';
import { withAuth } from '@/lib/auth-server-action.middleware';

export async function followUser(followedUserId: string) {
  return await withAuth(async (session) => {
    if (!followedUserId || typeof followedUserId !== 'string') {
      return { success: false, error: 'Validation error' };
    }

    const followService = new FollowService();
    const result = await followService.followUser(
      session.user.id,
      followedUserId
    );

    return result;
  });
}
