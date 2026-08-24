'use server';

import { refresh } from 'next/cache';
import { withAuth } from '@/platform/auth/auth-server-action.middleware';
import type { ApiResponse } from '@/shared/http/safe-execute';
import {
  StreamingPreferencesApplicationError,
  saveStreamingCountry,
} from './streaming-preferences';

const COUNTRY_UNKNOWN_ERROR = 'No pudimos guardar tu país. Inténtalo de nuevo.';

async function saveCountryResult(
  userId: string,
  formData: FormData
): Promise<ApiResponse<{ countryCode: string }>> {
  try {
    const data = await saveStreamingCountry(userId, formData);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof StreamingPreferencesApplicationError
          ? error.message
          : COUNTRY_UNKNOWN_ERROR,
    };
  }
}

export async function updateStreamingCountry(
  formData: FormData
): Promise<ApiResponse<{ countryCode: string }>> {
  return await withAuth(async (session) => {
    const result = await saveCountryResult(session.user.id, formData);

    if (result.success) {
      refresh();
    }

    return result;
  });
}

export async function setStreamingCountry(
  _state: ApiResponse<{ countryCode: string }>,
  formData: FormData
): Promise<ApiResponse<{ countryCode: string }>> {
  return await updateStreamingCountry(formData);
}
