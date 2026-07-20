import { headers } from 'next/headers';
import { ProfileService } from '@/modules/profiles/profile.service';
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

  const profileService = new ProfileService();

  const res: User | null = await profileService.getUser(session.user.id);
  return authenticatedJson(res);
}
