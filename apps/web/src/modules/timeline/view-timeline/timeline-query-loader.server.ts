import 'server-only';

import { enrichTheatricalAvailability } from '@/modules/theatrical-availability/enrich-theatrical-availability.server';
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

  const [items, contexts] = await Promise.all([
    enrichTheatricalAvailability(userId, page.items),
    getTimelineTrustedRatingContexts(
      userId,
      page.items.map((item) => ({
        mediaId: item.movieId,
        actorId: item.actorId,
      }))
    ).catch(() => null),
  ]);

  return {
    ...page,
    items: contexts
      ? items.map((item) => ({
          ...item,
          trustedRatingContext:
            contexts[
              timelineTrustedRatingContextKey({
                mediaId: item.movieId,
                actorId: item.actorId,
              })
            ] ?? null,
        }))
      : items,
  };
}
