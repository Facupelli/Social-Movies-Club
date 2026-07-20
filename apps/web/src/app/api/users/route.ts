import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { ProfileSearchService } from '@/modules/profiles/search-profiles/profile-search.service';
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

  const profileSearchService = new ProfileSearchService();

  const res: User[] = await profileSearchService.search(query);
  return authenticatedJson(res);
}
