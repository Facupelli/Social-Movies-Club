import { redirect } from 'next/navigation';
import { getCurrentAccountProfile } from '@/modules/account/current-account-profile';
import { getServerSession } from '@/platform/auth/get-server-session';
import { OnboardingProgress } from '@/shared/components/onboarding-progress';

const STEP_LABELS: Record<string, string> = {
  username: 'Creá tu perfil',
  ratings: '¿Qué viste?',
  people: 'Encontrá gente',
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
    <div className="relative mx-auto flex max-w-5xl flex-col text-card-foreground md:flex-row">
      <div className="flex-1 border-border bg-surface pb-[60px] md:border-r md:border-l md:pb-0">
        <OnboardingProgress labels={STEP_LABELS} />
        {children}
      </div>
    </div>
  );
}
