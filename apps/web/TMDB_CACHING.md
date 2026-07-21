# TMDB API Caching

TMDB is an external integration with one canonical shared server cache per operation.

## Ownership

- `src/platform/tmdb/tmdb.repository.ts` performs TMDB requests and cache reads/writes.
- `src/platform/tmdb/tmdb-cache-policy.ts` owns deterministic keys and finite TTLs.
- `src/platform/cache/cache.ts` selects Vercel KV, Redis, or the explicit `none` backend.
- Next.js Cache Components do not wrap TMDB operations.
- TanStack Query freshness for browser consumers is independent of this shared server cache.

## Policies

| Resource | Shared-cache TTL |
|---|---:|
| Search | 10 minutes |
| Watch providers | 12 hours |
| Media details | 24 hours |

Keys include every result-affecting input, including media type, media ID, query, page, language, region, and adult-content policy as applicable. Cached and upstream payloads are schema-validated. Cache failures fall back to TMDB and do not make the integration unavailable.

## Configuration

- `CACHE_BACKEND=vercel-kv` uses Vercel KV and is the default.
- `CACHE_BACKEND=redis` requires `REDIS_URL`.
- `CACHE_BACKEND=none` disables shared caching for local development.
- `TMDB_ACCESS_TOKEN` is required for upstream requests.
