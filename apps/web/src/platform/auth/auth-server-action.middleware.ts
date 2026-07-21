import { getServerSession } from '@/platform/auth/get-server-session';

export async function withAuth<T>(
  action: (session: { user: { id: string } }) => Promise<T>
): Promise<T | { success: false; error: string }> {
  const session = await getServerSession();

  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  return action(session);
}
