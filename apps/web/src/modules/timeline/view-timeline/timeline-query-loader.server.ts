import 'server-only';

import type { FeedCursor } from './feed-cursor';
import type { UserFeedPage } from './feed.types';
import { getUserFeed } from './timeline.pg';

export async function loadUserFeedPage({
  userId,
  cursor,
}: {
  userId: string;
  cursor?: FeedCursor | null;
}): Promise<UserFeedPage> {
  return await getUserFeed({ userId, cursor });
}
