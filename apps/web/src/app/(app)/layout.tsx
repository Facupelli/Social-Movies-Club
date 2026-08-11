import { redirect } from 'next/navigation';
import { getCurrentAccountProfile } from '@/modules/account/current-account-profile';
import { getServerSession } from '@/platform/auth/get-server-session';
import { Nav } from '@/shared/components/nav';

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  if (session) {
    const profile = await getCurrentAccountProfile(session.user.id);

    if (!profile?.username) {
      redirect('/onboarding/username');
    }

    if (!profile.onboardingCompletedAt) {
      redirect('/onboarding/ratings');
    }
  }

  return (
    <div className="relative mx-auto flex max-w-5xl flex-col text-card-foreground md:flex-row">
      <Nav />
      <div className="flex-1 border-border bg-surface pb-[60px] md:border-r md:border-l md:pb-0">
        {children}
      </div>
    </div>
  );
}
