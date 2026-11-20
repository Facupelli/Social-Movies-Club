'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useActionState } from 'react';
import { recommendationsQueryKeys } from '@/modules/recommendations/use-user-recommendations';
import { timelineQueryKeys } from '@/modules/timeline/view-timeline/use-user-feed';
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
  viewerUserId,
}: {
  countryCode: string;
  submitLabel: string;
  viewerUserId: string;
}) {
  const queryClient = useQueryClient();
  const [state, action] = useActionState<
    ApiResponse<{ countryCode: string }>,
    FormData
  >(async (previousState, formData: FormData) => {
    const result = await setStreamingCountry(previousState, formData);
    if (result.success) {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: timelineQueryKeys.chronological(viewerUserId),
        }),
        queryClient.invalidateQueries({
          queryKey: recommendationsQueryKeys.infinite(viewerUserId),
        }),
      ]);
    }
    return result;
  }, INITIAL_STATE);

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
