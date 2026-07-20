import { headers } from 'next/headers';
import { getProfileById } from '@/modules/profiles/profile.pg';
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

  const res: User | null = await getProfileById(session.user.id);
  return authenticatedJson(res);
}
