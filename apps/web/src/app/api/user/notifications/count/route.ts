import { headers } from 'next/headers';
import { countUnreadNotifications } from '@/modules/notifications/count-unread/count-unread-notifications';
import { auth } from '@/platform/auth/auth';
import {
  authenticatedJson,
  unauthorizedJson,
} from '@/shared/http/authenticated-response';

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return unauthorizedJson();
  }

  const res = await countUnreadNotifications(session.user.id);
  return authenticatedJson(res);
}
