'use server';

import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { ZodError } from 'zod';
import { validateUpdateUsername } from '@/modules/account/user-validation';
import { withAuth } from '@/platform/auth/auth-server-action.middleware';
import { DatabaseError } from '@/platform/database/postgres/db-utils';
import {
  type ApiFailure,
  type ApiResponse,
  execute,
} from '@/shared/http/safe-execute';
import { NEXT_CACHE_TAGS } from '@/shared/utilities/app.constants';
import { UsernamePgRepository } from './username.pg.repository';

const USERNAME_TAKEN_ERROR = 'Ese nombre de usuario ya está en uso.';
const USERNAME_UNKNOWN_ERROR =
  'No pudimos guardar el nombre de usuario. Inténtalo de nuevo.';

function toUsernameFailure(error: unknown): ApiFailure {
  if (error instanceof ZodError) {
    return {
      success: false,
      error: error.issues[0]?.message ?? 'El nombre de usuario no es válido.',
    };
  }

  if (error instanceof DatabaseError && error.code === '23505') {
    return { success: false, error: USERNAME_TAKEN_ERROR };
  }

  return { success: false, error: USERNAME_UNKNOWN_ERROR };
}

async function persistUsername(
  userId: string,
  formData: FormData
): Promise<ApiResponse<void>> {
  return await execute<void>(async () => {
    const { username } = validateUpdateUsername(formData);
    const repository = new UsernamePgRepository();

    await repository.update(userId, username);
  }, toUsernameFailure);
}

export async function updateUsername(
  formData: FormData
): Promise<ApiResponse<void>> {
  return await withAuth(async (session) => {
    const result = await persistUsername(session.user.id, formData);

    if (result.success) {
      revalidateTag(NEXT_CACHE_TAGS.getUserProfile(session.user.id));
    }

    return result;
  });
}

export async function createUsername(
  _state: ApiResponse<void>,
  formData: FormData
): Promise<ApiResponse<void>> {
  return await withAuth(async (session) => {
    const result = await persistUsername(session.user.id, formData);

    if (!result.success) {
      return result;
    }

    revalidateTag(NEXT_CACHE_TAGS.getUserProfile(session.user.id));
    redirect('/');
  });
}
