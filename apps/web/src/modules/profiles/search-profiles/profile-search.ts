import 'server-only';

import { searchProfiles as searchProfilesRepository } from './profile-search.pg';
import type { ProfileSearchResult } from './profile-search.types';
import {
  MIN_PROFILE_SEARCH_QUERY_LENGTH,
  normalizeProfileSearchQuery,
} from './profile-search-query';

export async function searchProfiles(
  query: string,
  viewerUserId: string
): Promise<ProfileSearchResult[]> {
  const normalizedQuery = normalizeProfileSearchQuery(query);

  if (normalizedQuery.length < MIN_PROFILE_SEARCH_QUERY_LENGTH) {
    return [];
  }

  return await searchProfilesRepository(normalizedQuery, viewerUserId);
}
