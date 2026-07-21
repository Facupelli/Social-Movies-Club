import { countUnreadNotifications } from '@/modules/notifications/count-unread/count-unread-notifications';
import { getServerSession } from '@/platform/auth/get-server-session';
import {
  authenticatedJson,
  unauthorizedJson,
} from '@/shared/http/authenticated-response';
import { execute } from '@/shared/http/safe-execute';

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return unauthorizedJson();
  }

  const result = await execute(
    () => countUnreadNotifications(session.user.id),
    () => ({ success: false, error: 'Unable to load unread notifications' })
  );

  if (!result.success) {
    return authenticatedJson(result, { status: 500 });
  }

  return authenticatedJson(result.data);
}
