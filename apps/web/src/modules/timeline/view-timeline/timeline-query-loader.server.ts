import 'server-only';

import { TimelineService } from './timeline.service';
import type { FeedItem } from './feed.types';

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
  const service = new TimelineService();
  return await service.getFeed({ userId, cursor });
}
