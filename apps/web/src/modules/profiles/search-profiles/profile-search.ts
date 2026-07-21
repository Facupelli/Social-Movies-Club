import 'server-only';

import { searchProfiles as searchProfilesRepository } from './profile-search.pg';
import {
  MIN_PROFILE_SEARCH_QUERY_LENGTH,
  normalizeProfileSearchQuery,
} from './profile-search-query';
import type { ProfileSearchResult } from './profile-search.types';

export async function searchProfiles(
  query: string,
  _viewerUserId: string
): Promise<ProfileSearchResult[]> {
  const normalizedQuery = normalizeProfileSearchQuery(query);

  if (normalizedQuery.length < MIN_PROFILE_SEARCH_QUERY_LENGTH) {
    return [];
  }

  return await searchProfilesRepository(normalizedQuery);
}
