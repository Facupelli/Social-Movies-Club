'use client';

import { useActionState } from 'react';
import { createUsername } from '@/modules/account/update-username/update-username';
import { UsernameField } from '@/modules/account/username-field';
import { SubmitButton } from '@/shared/components/submit-button';
import type { ApiResponse } from '@/shared/http/safe-execute';

const INITIAL_STATE: ApiResponse<void> = {
  success: false,
  error: '',
};

export function UsernameOnboardingForm() {
  const [state, action] = useActionState(createUsername, INITIAL_STATE);

  return (
    <form action={action} className="flex min-h-0 flex-1 flex-col pt-10">
      <UsernameField error={state.success ? undefined : state.error} />

      <div className="mt-auto pt-4">
        <SubmitButton className="h-12 w-full text-base" loadingText="Creando">
          Continuar
        </SubmitButton>
      </div>
    </form>
  );
}
