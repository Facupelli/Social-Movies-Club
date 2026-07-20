import { headers } from 'next/headers';
import { validateGetUserFeedQuery } from '@/modules/account/user-validation';
import { getUserAggregatedFeed } from '@/modules/timeline/view-timeline/timeline.pg';
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

  const res = await getUserAggregatedFeed({
    userId: session.user.id,
    cursor,
  });
  return authenticatedJson(res);
}
