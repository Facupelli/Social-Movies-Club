import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { UserService } from '@/modules/profiles/user.service';
import { auth } from '@/platform/auth/auth';
import type { User } from '@/platform/database/postgres/schema';
import {
  authenticatedJson,
  unauthorizedJson,
} from '@/shared/http/authenticated-response';

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return unauthorizedJson();
  }

  const searchParams = request.nextUrl.searchParams;

  const query = searchParams.get('q');
  if (!query) {
    return authenticatedJson({});
  }

  const userService = new UserService();

  const res: User[] = await userService.getUsers(query);
  return authenticatedJson(res);
}
