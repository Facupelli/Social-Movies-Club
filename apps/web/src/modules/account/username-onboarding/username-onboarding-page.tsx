import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { UsernameOnboardingForm } from '@/modules/account/username-onboarding/username-onboarding-form';
import { auth } from '@/platform/auth/auth';

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

      <UsernameOnboardingForm />
    </section>
  );
}
