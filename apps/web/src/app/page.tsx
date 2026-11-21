import type { Metadata } from 'next';
import { LandingPage } from '@/modules/landing/landing-page';
import { getServerSession } from '@/platform/auth/get-server-session';

export const metadata: Metadata = {
  title: 'QueVes | Qué mirar, según tu gente',
  description:
    'Descubrí películas y series a partir de las notas de personas que seguís.',
};

export default async function Page() {
  const session = await getServerSession();

  return <LandingPage signedIn={Boolean(session)} />;
}
