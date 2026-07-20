import 'server-only';

import type { FeedItem } from './feed.types';
import { getUserFeed } from './timeline.pg';

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
  return await getUserFeed({ userId, cursor });
}
