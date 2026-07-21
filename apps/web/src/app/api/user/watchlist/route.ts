import { getWatchlistStatusMap } from '@/modules/watchlist/get-watchlist-status/watchlist-status';
import { getServerSession } from '@/platform/auth/get-server-session';
import {
  authenticatedJson,
  unauthorizedJson,
} from '@/shared/http/authenticated-response';

export async function GET() {
  const session = await getServerSession();

  if (!session) {
    return unauthorizedJson();
  }

  try {
    const statusMap = await getWatchlistStatusMap(session.user.id);
    return authenticatedJson(statusMap);
  } catch {
    return authenticatedJson(
      { success: false, error: 'Unable to load watchlist status' },
      { status: 500 }
    );
  }
}
