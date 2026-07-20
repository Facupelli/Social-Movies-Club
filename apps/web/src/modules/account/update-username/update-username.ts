'use server';

import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { validateUpdateUsername } from '@/modules/account/user-validation';
import { UsernamePgRepository } from './username.pg.repository';
import { withAuth } from '@/platform/auth/auth-server-action.middleware';
import { type ApiResponse, execute } from '@/shared/http/safe-execute';
import { NEXT_CACHE_TAGS } from '@/shared/utilities/app.constants';

export async function updateUsername(
  formData: FormData
): Promise<ApiResponse<void>> {
  return await withAuth(async (session) => {
    const { username } = validateUpdateUsername(formData);

    const repository = new UsernamePgRepository();

    const result = await execute<void>(async () => {
      await repository.update(session.user.id, username);
    });

    if (result.success) {
      revalidateTag(NEXT_CACHE_TAGS.getUserProfile(session.user.id));
    }

    return result;
  });
}

export async function createUsername(
  formData: FormData
): Promise<ApiResponse<void>> {
  return await withAuth(async (session) => {
    const { username } = validateUpdateUsername(formData);

    const repository = new UsernamePgRepository();

    const result = await execute<void>(async () => {
      await repository.update(session.user.id, username);
    });

    if (result.success) {
      revalidateTag(NEXT_CACHE_TAGS.getUserProfile(session.user.id));
    }

    redirect('/');
  });
}
