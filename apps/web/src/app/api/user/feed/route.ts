import { ZodError } from 'zod';
import { validateGetUserFeedQuery } from '@/modules/account/user-validation';
import { loadUserFeedPage } from '@/modules/timeline/view-timeline/timeline-query-loader.server';
import { getServerSession } from '@/platform/auth/get-server-session';
import {
  authenticatedJson,
  unauthorizedJson,
} from '@/shared/http/authenticated-response';

export async function GET(request: Request) {
  const session = await getServerSession();

  if (!session) {
    return unauthorizedJson();
  }

  try {
    const { searchParams } = new URL(request.url);
    const { cursor } = validateGetUserFeedQuery(searchParams);
    const page = await loadUserFeedPage({
      userId: session.user.id,
      cursor,
    });

    return authenticatedJson(page);
  } catch (error) {
    if (error instanceof ZodError) {
      return authenticatedJson(
        { success: false, error: 'Invalid feed cursor' },
        { status: 400 }
      );
    }

    return authenticatedJson(
      { success: false, error: 'Unable to load the timeline feed' },
      { status: 500 }
    );
  }
}
