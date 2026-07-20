import { headers } from 'next/headers';
import { validateGetUserFeedQuery } from '@/modules/account/user-validation';
import type { AggregatedFeedItem } from '@/modules/timeline/view-timeline/feed.types';
import { TimelineService } from '@/modules/timeline/view-timeline/timeline.service';
import { auth } from '@/platform/auth/auth';
import {
  authenticatedJson,
  unauthorizedJson,
} from '@/shared/http/authenticated-response';

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return unauthorizedJson();
  }

  const { searchParams } = new URL(request.url);
  const { cursor } = validateGetUserFeedQuery(searchParams);

  const timelineService = new TimelineService();

  const res: { items: AggregatedFeedItem[]; nextCursor: string | null } =
    await timelineService.getAggregatedFeed({
      userId: session.user.id,
      cursor,
    });
  return authenticatedJson(res);
}
