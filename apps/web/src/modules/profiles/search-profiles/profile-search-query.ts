export const MIN_PROFILE_SEARCH_QUERY_LENGTH = 2;
export const MAX_PROFILE_SEARCH_QUERY_LENGTH = 100;

export function normalizeProfileSearchQuery(query: string): string {
  return query.trim();
}
