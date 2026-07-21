'use server';

import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import { withAuth } from '@/platform/auth/auth-server-action.middleware';
import type { ApiResponse } from '@/shared/http/safe-execute';
import { saveUsername, UsernameApplicationError } from './username';

const USERNAME_UNKNOWN_ERROR =
  'No pudimos guardar el nombre de usuario. Inténtalo de nuevo.';

async function saveUsernameResult(
  userId: string,
  formData: FormData
): Promise<ApiResponse<void>> {
  try {
    await saveUsername(userId, formData);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof UsernameApplicationError
          ? error.message
          : USERNAME_UNKNOWN_ERROR,
    };
  }
}

export async function updateUsername(
  formData: FormData
): Promise<ApiResponse<void>> {
  return await withAuth(async (session) => {
    const result = await saveUsernameResult(session.user.id, formData);

    if (result.success) {
      refresh();
    }

    return result;
  });
}

export async function createUsername(
  _state: ApiResponse<void>,
  formData: FormData
): Promise<ApiResponse<void>> {
  return await withAuth(async (session) => {
    const result = await saveUsernameResult(session.user.id, formData);

    if (!result.success) {
      return result;
    }

    redirect('/');
  });
}
