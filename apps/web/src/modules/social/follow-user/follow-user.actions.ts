'use server';

import { refresh } from 'next/cache';
import { validateFollowUser } from '@/modules/account/user-validation';
import {
  followUser,
  unfollowUser,
} from '@/modules/social/follow-user/follow-user';
import { withAuth } from '@/platform/auth/auth-server-action.middleware';
import { type ApiResponse, execute } from '@/shared/http/safe-execute';

function getValidatedTargetUserId(formData: FormData, viewerUserId: string) {
  const { followedUserId } = validateFollowUser(formData);

  if (followedUserId === viewerUserId) {
    throw new Error('Users cannot follow themselves');
  }

  return followedUserId;
}

export async function followUserAction(
  _: ApiResponse<void>,
  formData: FormData
): Promise<ApiResponse<void>> {
  return await withAuth(async (session) => {
    const result = await execute<void>(async () => {
      const followedUserId = getValidatedTargetUserId(
        formData,
        session.user.id
      );
      await followUser(session.user.id, followedUserId);
    });

    if (result.success) {
      refresh();
    }

    return result;
  });
}

export async function unfollowUserAction(
  _: ApiResponse<void>,
  formData: FormData
): Promise<ApiResponse<void>> {
  return await withAuth(async (session) => {
    const result = await execute<void>(async () => {
      const followedUserId = getValidatedTargetUserId(
        formData,
        session.user.id
      );
      await unfollowUser(session.user.id, followedUserId);
    });

    if (result.success) {
      refresh();
    }

    return result;
  });
}
