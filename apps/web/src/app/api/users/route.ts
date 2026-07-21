import type { NextRequest } from 'next/server';
import {
  MAX_PROFILE_SEARCH_QUERY_LENGTH,
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
  if (query.length > MAX_PROFILE_SEARCH_QUERY_LENGTH) {
    return authenticatedJson({ error: 'Search query is too long' }, { status: 400 });
  }

  try {
    const results = await searchProfiles(query, session.user.id);
    return authenticatedJson(results);
  } catch {
    return authenticatedJson(
      { error: 'Unable to search users' },
      { status: 500 }
    );
  }
}
