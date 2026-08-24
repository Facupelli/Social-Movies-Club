'use server';

import { refresh } from 'next/cache';
import { withAuth } from '@/platform/auth/auth-server-action.middleware';
import type { ApiResponse } from '@/shared/http/safe-execute';
import {
  StreamingPreferencesApplicationError,
  saveStreamingProviders,
} from './streaming-preferences';

const PROVIDERS_UNKNOWN_ERROR =
  'No pudimos guardar tus servicios de streaming. Inténtalo de nuevo.';

async function saveProvidersResult(
  userId: string,
  formData: FormData
): Promise<ApiResponse<{ providerIds: string[] }>> {
  try {
    const data = await saveStreamingProviders(userId, formData);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof StreamingPreferencesApplicationError
          ? error.message
          : PROVIDERS_UNKNOWN_ERROR,
    };
  }
}

export async function updateStreamingProviders(
  formData: FormData
): Promise<ApiResponse<{ providerIds: string[] }>> {
  return await withAuth(async (session) => {
    const result = await saveProvidersResult(session.user.id, formData);

    if (result.success) {
      refresh();
    }

    return result;
  });
}

export async function setStreamingProviders(
  _state: ApiResponse<{ providerIds: string[] }>,
  formData: FormData
): Promise<ApiResponse<{ providerIds: string[] }>> {
  return await updateStreamingProviders(formData);
}
