'use client';

import { useActionState } from 'react';
import { SubmitButton } from '@/shared/components/submit-button';
import type { ApiResponse } from '@/shared/http/safe-execute';
import { setStreamingCountry } from './update-streaming-country';

const INITIAL_STATE: ApiResponse<{ countryCode: string }> = {
  success: false,
  error: '',
};

export function StreamingCountryForm({
  countryCode,
  submitLabel,
}: {
  countryCode: string;
  submitLabel: string;
}) {
  const [state, action] = useActionState(setStreamingCountry, INITIAL_STATE);

  return (
    <form action={action} className="flex flex-col gap-2 pt-4">
      <input name="countryCode" type="hidden" value={countryCode} />
      {!state.success && state.error && (
        <p aria-live="polite" className="text-destructive text-sm">
          {state.error}
        </p>
      )}
      <SubmitButton className="h-10 w-full text-sm" loadingText="Guardando...">
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
