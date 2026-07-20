import 'server-only';

import { UserService } from '@/modules/profiles/user.service';
import type { FeedItem } from '@/modules/profiles/user.types';

export type UserFeedPage = {
  items: FeedItem[];
  nextCursor: string | null;
};

export async function loadUserFeedPage({
  userId,
  cursor,
}: {
  userId: string;
  cursor?: string | null;
}): Promise<UserFeedPage> {
  const userService = new UserService();
  return await userService.getFeed({ userId, cursor });
}
