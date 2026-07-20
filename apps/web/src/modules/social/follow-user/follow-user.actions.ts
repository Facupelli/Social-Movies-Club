'use server';

import { revalidateTag } from 'next/cache';
import { validateFollowUser } from '@/modules/account/user-validation';
import {
  followUser,
  unfollowUser,
} from '@/modules/social/follow-user/follow-user';
import { withAuth } from '@/platform/auth/auth-server-action.middleware';
import { type ApiResponse, execute } from '@/shared/http/safe-execute';
import { NEXT_CACHE_TAGS } from '@/shared/utilities/app.constants';

function revalidateFollowTags(userId: string, followedUserId: string): void {
  revalidateTag(NEXT_CACHE_TAGS.getIsFollowingUser(userId, followedUserId));
  revalidateTag(NEXT_CACHE_TAGS.getIsFollowingUserByProfile(followedUserId));
  revalidateTag(NEXT_CACHE_TAGS.getIsFollowingUserBySession(userId));
}

export async function followUserAction(
  _: ApiResponse<void>,
  formData: FormData
): Promise<ApiResponse<void>> {
  return await withAuth(async (session) => {
    const { followedUserId } = validateFollowUser(formData);

    const result = await execute<void>(async () => {
      await followUser(session.user.id, followedUserId);
    });

    if (result.success) {
      revalidateFollowTags(session.user.id, followedUserId);
    }

    return result;
  });
}

export async function unfollowUserAction(
  _: ApiResponse<void>,
  formData: FormData
): Promise<ApiResponse<void>> {
  return await withAuth(async (session) => {
    const { followedUserId } = validateFollowUser(formData);

    const result = await execute<void>(async () => {
      await unfollowUser(session.user.id, followedUserId);
    });

    if (result.success) {
      revalidateFollowTags(session.user.id, followedUserId);
    }

    return result;
  });
}
