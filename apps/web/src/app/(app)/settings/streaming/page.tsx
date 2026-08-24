import { redirect } from 'next/navigation';
import { StreamingPreferencesPage } from '@/modules/account/streaming-preferences/streaming-preferences-page';
import { getServerSession } from '@/platform/auth/get-server-session';

export default async function SettingsStreamingPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/');
  }

  return <StreamingPreferencesPage userId={session.user.id} />;
}
