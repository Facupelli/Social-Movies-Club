'use server';

import { ObjectId } from 'mongodb';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { UserService } from '../user.service';

export async function followUser(followedUserStringId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Unauthorized');
  }

  const userId = new ObjectId(session.user.id);
  const followedUserId = new ObjectId(followedUserStringId);
  const userService = new UserService();

  const result = await userService.followUser(userId, followedUserId);
  return result;
}
