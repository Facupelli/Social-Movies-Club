import type { NextRequest } from 'next/server';
import {
  MIN_PROFILE_SEARCH_QUERY_LENGTH,
  normalizeProfileSearchQuery,
} from '@/modules/profiles/search-profiles/profile-search-query';
import { searchProfiles } from '@/modules/profiles/search-profiles/profile-search';
import { getServerSession } from '@/platform/auth/get-server-session';
import {
  authenticatedJson,
  unauthorizedJson,
} from '@/shared/http/authenticated-response';

export async function GET(request: NextRequest) {
  const session = await getServerSession();

  if (!session) {
    return unauthorizedJson();
  }

  const query = normalizeProfileSearchQuery(
    request.nextUrl.searchParams.get('q') ?? ''
  );
  if (query.length < MIN_PROFILE_SEARCH_QUERY_LENGTH) {
    return authenticatedJson([]);
  }

  try {
    const results = await searchProfiles(query, session.user.id);
    return authenticatedJson(results);
  } catch {
    return authenticatedJson([], { status: 500 });
  }
}
