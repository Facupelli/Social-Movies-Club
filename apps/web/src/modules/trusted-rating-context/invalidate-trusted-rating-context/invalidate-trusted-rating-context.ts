import type { QueryClient } from '@tanstack/react-query';
import { timelineQueryKeys } from '@/modules/timeline/view-timeline/use-user-feed';
import { trustedRatingQueryKeys } from '../get-search-trusted-rating-summaries/use-search-trusted-rating-summaries';

/** Invalidates every browser-owned representation containing current trusted context. */
export async function invalidateTrustedRatingContext(
  queryClient: QueryClient,
  viewerUserId: string
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: trustedRatingQueryKeys.viewerScope(viewerUserId),
    }),
    queryClient.invalidateQueries({
      queryKey: timelineQueryKeys.chronological(viewerUserId),
    }),
  ]);
}
