import { ObjectId } from 'mongodb';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { UserService } from '@/users/user.service';
import type { UserViewModel } from '@/users/user.types';

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  const userId = new ObjectId(session.user.id);
  const userService = new UserService();

  const res: UserViewModel | null = await userService.getUser(userId);
  return Response.json(res);
}
