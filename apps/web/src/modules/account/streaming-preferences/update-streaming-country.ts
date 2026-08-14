'use server';

import { refresh } from 'next/cache';
import { withAuth } from '@/platform/auth/auth-server-action.middleware';
import type { ApiResponse } from '@/shared/http/safe-execute';
import {
  StreamingPreferencesApplicationError,
  saveStreamingCountry,
} from './streaming-preferences';

const COUNTRY_UNKNOWN_ERROR = 'No pudimos guardar tu país. Inténtalo de nuevo.';

export async function updateStreamingCountry(
  formData: FormData
): Promise<ApiResponse<{ countryCode: string }>> {
  return await withAuth(async (session) => {
    try {
      const data = await saveStreamingCountry(session.user.id, formData);
      refresh();
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
  });
}
