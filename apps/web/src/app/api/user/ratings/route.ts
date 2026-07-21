import { getRatingStatusMap } from '@/modules/ratings/get-rating-status/get-rating-status';
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
    return authenticatedJson(await getRatingStatusMap(session.user.id));
  } catch {
    return authenticatedJson(
      { success: false, error: 'Unable to load rating status' },
      { status: 500 }
    );
  }
}
