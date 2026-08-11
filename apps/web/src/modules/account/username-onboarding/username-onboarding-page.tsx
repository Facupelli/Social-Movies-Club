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
    redirect('/onboarding/ratings');
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col px-4 py-6 md:px-8">
      <div>
        <h1 className="font-bold text-xl tracking-tight">
          Elegí tu nombre de usuario
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Así podrán encontrarte y seguirte otras personas en QueVes.
        </p>
      </div>

      <UsernameOnboardingForm />
    </section>
  );
}
