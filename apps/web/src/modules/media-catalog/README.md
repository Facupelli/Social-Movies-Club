# Media Catalog

## Purpose

Media Catalog finds movie and TV metadata and persists media referenced by users.

## Business invariants

- Movies and TV series are supported.
- TMDB is the external metadata source.
- Search results are cached but persisted only after user interaction.
- Media identity includes media type and TMDB ID.

## Persistent server-cache ownership

TMDB repository reads use the single shared backend selected by `CACHE_BACKEND`
(`vercel-kv`, `redis`, or the explicit development fallback `none`). Next.js
Cache Components do not wrap TMDB calls. Policies and key construction are
owned by `src/platform/tmdb/tmdb-cache-policy.ts`: searches live for 10 minutes,
watch providers for 12 hours, and media details for 24 hours. All policies are
time-based because TMDB has no application-owned mutation invalidation path.

Public profiles remain uncached. Cache Components are not enabled, and profile
identity must not be put into the TMDB KV/Redis infrastructure. Personalized
profile data, follow state, ratings, watchlists, and sessions are always read
outside this persistent cache.
