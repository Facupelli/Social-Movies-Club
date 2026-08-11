'use client';

import { useActionState } from 'react';
import { UsernameField } from '@/modules/account/username-field';
import { createUsername } from '@/modules/account/update-username/update-username';
import { SubmitButton } from '@/shared/components/submit-button';
import type { ApiResponse } from '@/shared/http/safe-execute';

const INITIAL_STATE: ApiResponse<void> = {
  success: false,
  error: '',
};

export function UsernameOnboardingForm() {
  const [state, action] = useActionState(createUsername, INITIAL_STATE);

  return (
    <form action={action} className="pt-4">
      <UsernameField error={state.success ? undefined : state.error} />

      <div className="pt-4">
        <SubmitButton className="w-full" loadingText="Creando">
          Crear
        </SubmitButton>
      </div>
    </form>
  );
}
