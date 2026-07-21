'use client';

import { useActionState, useState } from 'react';
import { UsernameField } from '@/modules/account/username-field';
import { SubmitButton } from '@/shared/components/submit-button';
import type { ApiResponse } from '@/shared/http/safe-execute';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { updateUsername } from './update-username';

const INITIAL_STATE: ApiResponse<void> = { success: false, error: '' };

export function UpsertUsernameDialog({
  canEdit,
  username,
}: {
  canEdit: boolean;
  username: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild className="cursor-pointer">
        <Button
          className="px-0 h-auto"
          disabled={!canEdit}
          size="sm"
          variant="link"
        >
          {username ?? 'Crear nombre de usuario'}
        </Button>
      </DialogTrigger>
      {open && (
        <UsernameDialogContent
          close={() => setOpen(false)}
          username={username}
        />
      )}
    </Dialog>
  );
}

function UsernameDialogContent({
  close,
  username,
}: {
  close: () => void;
  username: string | null;
}) {
  const handleUpdateUsername = async (
    _state: ApiResponse<void>,
    formData: FormData
  ) => {
    const result = await updateUsername(formData);
    if (result.success) {
      close();
    }
    return result;
  };
  const [state, action] = useActionState(handleUpdateUsername, INITIAL_STATE);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {username ? 'Actualizar' : 'Crear'} nombre de usuario
        </DialogTitle>
        <DialogDescription>
          Al crear un nombre de usuario, los demás usuarios podrán buscarte en
          el buscador principal escribiendo tu @ para seguirte!
        </DialogDescription>

        <form action={action} className="pt-4">
          <UsernameField
            currentUsername={username}
            error={state.success ? undefined : state.error}
          />

          <DialogFooter className="gap-2 pt-4 md:gap-6">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </DialogClose>

            <SubmitButton loadingText={username ? 'Actualizando' : 'Creando'}>
              {username ? 'Actualizar' : 'Crear'}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogHeader>
    </DialogContent>
  );
}
