export const TMDB_CACHE_TTL_SECONDS = {
  mediaDetails: 24 * 60 * 60,
  watchProviders: 12 * 60 * 60,
  search: 10 * 60,
} as const;

export type TmdbCacheResource = 'media-details' | 'watch-providers' | 'search';

type CacheKeyValue = boolean | number | string;

/**
 * Builds an encoded, deterministic key. Every result-affecting option must be
 * passed explicitly. URLSearchParams encoding prevents delimiter collisions in
 * user-controlled search text.
 */
export function buildTmdbCacheKey(
  resource: TmdbCacheResource,
  inputs: Record<string, CacheKeyValue>
): string {
  const params = new URLSearchParams(
    Object.entries(inputs)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => [key, String(value)])
  );

  return `tmdb:v1:${resource}:${params.toString()}`;
}

export function normalizeTmdbSearchQuery(query: string): string {
  return query.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-US');
}
