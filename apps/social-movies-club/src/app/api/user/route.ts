import { headers } from 'next/headers';
import type { User } from '@/infra/neon/schema';
import { auth } from '@/lib/auth';
import { UserService } from '@/users/user.service';

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return Response.json({ success: false, error: 'Unauthorized' });
  }

  const userService = new UserService();

  const res: User | null = await userService.getUser(session.user.id);
  return Response.json(res);
}
