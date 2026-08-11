import { ZodError } from 'zod';
import { recommendationsCursorFromSearchParams } from '@/modules/recommendations/recommendations-cursor';
import { loadUserRecommendationsPage } from '@/modules/recommendations/recommendations-query-loader.server';
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
    const cursor = recommendationsCursorFromSearchParams(searchParams);
    const page = await loadUserRecommendationsPage({
      userId: session.user.id,
      cursor,
    });

    return authenticatedJson(page);
  } catch (error) {
    if (error instanceof ZodError) {
      return authenticatedJson(
        { success: false, error: 'Invalid recommendations cursor' },
        { status: 400 }
      );
    }

    return authenticatedJson(
      { success: false, error: 'Unable to load recommendations' },
      { status: 500 }
    );
  }
}
