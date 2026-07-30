import 'server-only';

import {
  getTimelineTrustedRatingContexts,
  timelineTrustedRatingContextKey,
} from '@/modules/trusted-rating-context/get-timeline-trusted-rating-contexts/get-timeline-trusted-rating-contexts';
import type { UserFeedPage } from './feed.types';
import type { FeedCursor } from './feed-cursor';
import { getUserFeed } from './timeline.pg';

export async function loadUserFeedPage({
  userId,
  cursor,
}: {
  userId: string;
  cursor?: FeedCursor | null;
}): Promise<UserFeedPage> {
  const page = await getUserFeed({ userId, cursor });

  try {
    const contexts = await getTimelineTrustedRatingContexts(
      userId,
      page.items.map((item) => ({
        mediaId: item.movieId,
        actorId: item.actorId,
      }))
    );

    return {
      ...page,
      items: page.items.map((item) => ({
        ...item,
        trustedRatingContext:
          contexts[
            timelineTrustedRatingContextKey({
              mediaId: item.movieId,
              actorId: item.actorId,
            })
          ] ?? null,
      })),
    };
  } catch {
    return page;
  }
}
