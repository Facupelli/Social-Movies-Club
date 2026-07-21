import 'server-only';

import type { UserFeedPage } from './feed.types';
import { getUserFeed } from './timeline.pg';

export async function loadUserFeedPage({
  userId,
  cursor,
}: {
  userId: string;
  cursor?: string | null;
}): Promise<UserFeedPage> {
  return await getUserFeed({ userId, cursor });
}
