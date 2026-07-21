'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { UsernameField } from '@/modules/account/username-field';
import { createUsername } from '@/modules/account/update-username/update-username';
import { SubmitButton } from '@/shared/components/submit-button';
import type { ApiResponse } from '@/shared/http/safe-execute';
import { Button } from '@/shared/ui/button';

const INITIAL_STATE: ApiResponse<void> = {
  success: false,
  error: '',
};

export function UsernameOnboardingForm() {
  const [state, action] = useActionState(createUsername, INITIAL_STATE);

  return (
    <form action={action} className="pt-4">
      <UsernameField error={state.success ? undefined : state.error} />

      <div className="flex items-center gap-4 pt-4">
        <Button asChild className="flex-1" variant="secondary">
          <Link href="/">Cancelar</Link>
        </Button>

        <SubmitButton className="flex-1" loadingText="Creando">
          Crear
        </SubmitButton>
      </div>
    </form>
  );
}
