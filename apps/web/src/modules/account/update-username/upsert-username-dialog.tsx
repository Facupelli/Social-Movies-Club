'use client';

import { useActionState, useState } from 'react';
import { authClient } from '@/platform/auth/auth-client';
import { SubmitButton } from '@/shared/components/submit-button';
import { useIsOwner } from '@/shared/hooks/use-is-owner';
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
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { updateUsername } from './update-username';

export function UpsertUsernameDialog({
  username,
}: {
  username: string | null;
}) {
  const { data: session } = authClient.useSession();
  const [open, setOpen] = useState(false);

  const { isOwner } = useIsOwner();

  const handleUpdateUsername = async (
    _state: ApiResponse<void>,
    formData: FormData
  ) => {
    const result = await updateUsername(formData);
    if (result.success) {
      setOpen(false);
    }

    return result;
  };

  const [_, action] = useActionState(handleUpdateUsername, {
    success: false,
    error: '',
  });

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild className="cursor-pointer">
        <Button
          className="px-0 h-auto"
          disabled={!(session && isOwner)}
          size="sm"
          variant="link"
        >
          {username ? username : 'Crear nombre de usuario'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {username ? 'Actualizar' : 'Crear'} nombre de usuario
          </DialogTitle>
          <DialogDescription>
            Al crear un nombre de usuario, los demás usuarios podrán buscarte en
            el buscador principal escribiendo tu @ para seguirte!
          </DialogDescription>

          <form className="pt-4">
            <Label htmlFor="username">Nombre de usuario</Label>
            <Input id="username" name="username" type="text" />

            <DialogFooter className="pt-4 gap-2 md:gap-6">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancelar
                </Button>
              </DialogClose>

              <SubmitButton
                formAction={action}
                loadingText={username ? 'Actualizando' : 'Creando'}
              >
                {username ? 'Actualizar' : 'Crear'}
              </SubmitButton>
            </DialogFooter>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
