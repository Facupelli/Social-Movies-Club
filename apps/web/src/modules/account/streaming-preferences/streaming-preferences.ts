import 'server-only';

import { ZodError } from 'zod';
import { DatabaseError } from '@/platform/database/postgres/db-utils';
import {
  findUserStreamingCountry,
  persistStreamingCountry,
  replaceStreamingProviders,
  UNKNOWN_STREAMING_PROVIDER_CODE,
} from './streaming-preferences.pg';
import {
  validateStreamingCountry,
  validateStreamingProviders,
} from './streaming-preferences.validation';

const COUNTRY_UNKNOWN_ERROR = 'No pudimos guardar tu país. Inténtalo de nuevo.';
const PROVIDERS_UNKNOWN_ERROR =
  'No pudimos guardar tus servicios de streaming. Inténtalo de nuevo.';
const COUNTRY_REQUIRED_ERROR =
  'Elige tu país antes de seleccionar servicios de streaming.';
const UNKNOWN_PROVIDER_ERROR =
  'Uno o más proveedores no son válidos. Revisa tu selección e inténtalo de nuevo.';

export class StreamingPreferencesApplicationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StreamingPreferencesApplicationError';
  }
}

export async function saveStreamingCountry(
  userId: string,
  formData: FormData
): Promise<{ countryCode: string }> {
  try {
    const { countryCode } = validateStreamingCountry(formData);
    const storedCountryCode = await persistStreamingCountry(
      userId,
      countryCode
    );

    return { countryCode: storedCountryCode };
  } catch (error) {
    if (error instanceof ZodError) {
      throw new StreamingPreferencesApplicationError(
        error.issues[0]?.message ?? COUNTRY_UNKNOWN_ERROR
      );
    }

    throw new StreamingPreferencesApplicationError(COUNTRY_UNKNOWN_ERROR);
  }
}

export async function saveStreamingProviders(
  userId: string,
  formData: FormData
): Promise<{ providerIds: string[] }> {
  try {
    const { providerIds } = validateStreamingProviders(formData);

    const countryCode = await findUserStreamingCountry(userId);
    if (!countryCode) {
      throw new StreamingPreferencesApplicationError(COUNTRY_REQUIRED_ERROR);
    }

    const persistedProviderIds = await replaceStreamingProviders(
      userId,
      providerIds
    );

    return { providerIds: persistedProviderIds };
  } catch (error) {
    if (error instanceof StreamingPreferencesApplicationError) {
      throw error;
    }

    if (error instanceof ZodError) {
      throw new StreamingPreferencesApplicationError(
        error.issues[0]?.message ?? PROVIDERS_UNKNOWN_ERROR
      );
    }

    if (
      error instanceof DatabaseError &&
      error.code === UNKNOWN_STREAMING_PROVIDER_CODE
    ) {
      throw new StreamingPreferencesApplicationError(UNKNOWN_PROVIDER_ERROR);
    }

    throw new StreamingPreferencesApplicationError(PROVIDERS_UNKNOWN_ERROR);
  }
}
