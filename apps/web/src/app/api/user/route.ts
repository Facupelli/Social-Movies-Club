import { headers } from 'next/headers';
import { UserService } from '@/modules/profiles/user.service';
import { auth } from '@/platform/auth/auth';
import type { User } from '@/platform/database/postgres/schema';
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

  const userService = new UserService();

  const res: User | null = await userService.getUser(session.user.id);
  return authenticatedJson(res);
}
