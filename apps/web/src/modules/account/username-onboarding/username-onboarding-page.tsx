import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createUsername } from '@/modules/account/update-username/update-username';
import { auth } from '@/platform/auth/auth';
import { SubmitButton } from '@/shared/components/submit-button';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

export default async function UsernamePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/');
  }

  return (
    <section className="p-4 min-h-svh">
      <h1 className="font-bold text-pretty text-lg">Crear nombre de usuario</h1>
      <p className="text-pretty text-muted-foreground">
        Al crear un nombre de usuario, los demás usuarios podrán buscarte en el
        buscador principal escribiendo tu @ para seguirte.
      </p>

      <form className="pt-4">
        <div className="space-y-1">
          <Label htmlFor="username">Nombre de usuario</Label>
          <Input id="username" name="username" type="text" />
        </div>

        <div className="flex items-center gap-4 pt-4">
          <Button className="flex-1" type="button" variant="secondary">
            Cancelar
          </Button>

          <SubmitButton
            className="flex-1"
            formAction={createUsername}
            loadingText="Creando"
          >
            Crear
          </SubmitButton>
        </div>
      </form>
    </section>
  );
}
