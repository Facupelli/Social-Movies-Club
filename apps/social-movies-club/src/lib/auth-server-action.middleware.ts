import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export async function withAuth<T>(
  action: (session: { user: { id: string } }) => Promise<T>
): Promise<T | { success: false; error: string }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  return action(session);
}
