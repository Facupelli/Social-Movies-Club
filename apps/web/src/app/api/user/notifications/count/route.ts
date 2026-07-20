import { headers } from 'next/headers';
import { UnreadNotificationsService } from '@/modules/notifications/count-unread/unread-notifications.service';
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

  const notificationService = new UnreadNotificationsService();

  const res = await notificationService.count(session.user.id);
  return authenticatedJson(res);
}
