import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import {
  type ProfileSearchResult,
  searchProfiles,
} from '@/modules/profiles/search-profiles/profile-search.pg';
import { auth } from '@/platform/auth/auth';
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

  const res: ProfileSearchResult[] = await searchProfiles(query);
  return authenticatedJson(res);
}
