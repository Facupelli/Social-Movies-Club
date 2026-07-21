import { redirect } from 'next/navigation';
import { getCurrentAccountProfile } from '@/modules/account/current-account-profile';
import { UsernameOnboardingForm } from '@/modules/account/username-onboarding/username-onboarding-form';
import { getServerSession } from '@/platform/auth/get-server-session';

export default async function UsernamePage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/');
  }

  const profile = await getCurrentAccountProfile(session.user.id);

  if (profile?.username) {
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
