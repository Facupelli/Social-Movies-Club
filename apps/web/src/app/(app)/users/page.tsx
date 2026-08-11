import { redirect } from 'next/navigation';
import SearchUsersPage from '@/modules/social/search-users/search-users-page';
import { getServerSession } from '@/platform/auth/get-server-session';

export default async function UsersPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/');
  }

  return <SearchUsersPage viewerUserId={session.user.id} />;
}
