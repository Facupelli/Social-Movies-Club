import { redirect } from 'next/navigation';
import { getCurrentAccountProfile } from '@/modules/account/current-account-profile';
import { getServerSession } from '@/platform/auth/get-server-session';
import { OnboardingProgress } from '@/shared/components/onboarding-progress';

const STEP_LABELS: Record<string, string> = {
  username: 'Tu perfil',
  ratings: 'Tus gustos',
  people: 'Tu gente',
};

export default async function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  if (!session) {
    redirect('/');
  }

  const profile = await getCurrentAccountProfile(session.user.id);

  if (profile?.onboardingCompletedAt) {
    redirect('/');
  }

  return (
    <div className="relative mx-auto flex h-svh max-w-5xl flex-col overflow-hidden text-card-foreground md:flex-row">
      <div className="flex min-h-0 flex-1 flex-col border-border bg-surface md:border-x">
        <OnboardingProgress labels={STEP_LABELS} />
        {children}
      </div>
    </div>
  );
}
