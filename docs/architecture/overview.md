# Architecture Overview

Social Movies Club is a pnpm workspace monorepo managed with Turborepo.

## Applications

- `apps/web`: Next.js App Router application containing the UI, Route Handlers, Server Actions, authentication, and core domain logic.
- `apps/queue-system`: NestJS and BullMQ service intended to process feed fan-out jobs.

## Data sources

- Neon PostgreSQL is the system of record.
- Drizzle manages users, media, ratings, follows, feeds, watchlists, and notifications.
- TMDB supplies movie, TV, and watch-provider metadata.
- TMDB responses may use the configured shared cache backend.
- The browser accesses interactive server state through TanStack Query and purpose-specific Route Handlers.

## Data ownership

Every resource must have one clear live owner.

### Server Component-owned data

Use Server Components for route-level data that does not require independent browser refetching or pagination.

Current Server Component-owned resources include:

- Public profile headers
- Follow status and summaries
- Following lists
- Full profile watchlists
- Notification lists
- Username onboarding state

Server Components call server-only application services directly. They must not call the application’s own Route Handlers.

The expected dependency direction is:

```text
Server Component -> application service -> repository
```

Authenticated and personalized Server Component data is uncached across requests unless a resource receives an explicit cache policy.

### TanStack Query-owned data

Use TanStack Query when the browser needs ongoing ownership, including pagination, lazy loading, polling, optimistic updates, or reuse across Client Components.

Current TanStack-owned resources include:

- Chronological feed
- Profile-rating pagination
- Media search
- User search
- Watch providers
- Current-viewer rating-status map
- Current-viewer watchlist-status map
- Unread notification count

The initial page of an important query may be prefetched directly in a Server Component and dehydrated. After hydration, TanStack Query owns every live representation of that resource.

Do not independently render the same live resource from both a Server Component read and a TanStack query.

TanStack Query data is kept in memory and is not persisted across browser reloads.

## Query keys

Query keys are owned by the module responsible for the resource.

Every key must:

- Be a readonly, JSON-serializable tuple.
- Include every value that affects the result.
- Keep infinite and finite queries distinct.
- Provide explicit partial scopes where mutation invalidation requires them.

Personalized keys follow this structure:

```ts
['viewer', viewerUserId, ...resourceSegments]
```

The platform layer owns this generic convention, but it must not depend on feature-specific keys or types.

Public TMDB-derived queries are not viewer-scoped. Authenticated user search is viewer-scoped because future results may depend on privacy, blocking, follow state, or recommendations.

## Route Handlers

Create a Route Handler only when an HTTP boundary is intentional, such as:

- A browser TanStack Query request
- Better Auth
- TMDB credential mediation
- An externally consumed API
- Webhooks, uploads, or streaming

Current Route Handlers support:

- Authentication
- Media search
- Watch providers
- Chronological-feed pagination
- Profile-rating pagination
- User search
- Rating-status lookup
- Watchlist-status lookup
- Unread-count polling

Authenticated handlers must:

- Authenticate independently.
- Derive viewer identity from the session.
- Validate all route and query input.
- Return private, non-cacheable responses.
- Delegate to application services rather than duplicate domain logic.

Server Components must never use Route Handlers as an internal data-fetching hop.

## Server Actions

Use Server Actions for mutations closely coupled to the Next.js UI, including:

- Rating media
- Adding or removing watchlist entries
- Following or unfollowing users
- Marking notifications as read
- Creating or updating a username

Every Server Action must:

- Authenticate internally.
- Authorize independently of the UI.
- Validate its input.
- Derive user identity from the session.
- Return a safe typed result.
- Update every affected cache according to its owner.

Client-supplied or hidden user IDs must never be treated as mutation authority.

## Cache consistency

Next.js server caches and TanStack Query are independent. Neither system invalidates the other automatically.

After a mutation, identify every affected representation:

- Refresh uncached Server Component data when it owns the resource.
- Update or invalidate TanStack Query when it owns the resource.
- Invalidate a persistent shared cache only when one exists.

Prefer `setQueryData` when a mutation returns the complete authoritative state. Use targeted `invalidateQueries` when sorting, filtering, pagination, or derived membership makes direct updates unsafe.

Examples:

- Rating updates the rating-status entry, invalidates viewer-relative profile-rating queries, and removes the watchlist-status entry when applicable.
- Watchlist mutations update the exact current-viewer status map and refresh an affected RSC watchlist.
- Follow mutations refresh uncached RSC follow data. Feed membership becomes fresh through the feed query’s normal freshness policy.
- Marking notifications read sets the unread-count query to the authoritative returned count.
- Username mutations refresh uncached profile and onboarding output.

A user’s own ratings do not appear in their chronological feed, so rating mutations do not invalidate the author’s feed.

## Persistent server caching

Persistent caching is opt-in. Do not add it without a concrete performance or external-service reason.

Private, personalized, authorization-sensitive, and rapidly changing data must remain uncached across server requests.

This includes:

- Sessions and permissions
- Feeds
- Follow relationships
- Following lists
- Profile-rating pages
- Full profile watchlists
- Rating and watchlist status maps
- Notifications and unread counts
- User search
- Onboarding state

Currently, only TMDB operations use persistent shared caching:

| Resource | TTL |
| --- | ---: |
| Media search | 10 minutes |
| Watch providers | 12 hours |
| Media details | 24 hours |

The shared backend is selected through `CACHE_BACKEND` and may be Vercel KV, Redis, or explicitly disabled.

A TMDB operation must have only one persistent shared cache layer. Do not wrap the same operation in both the shared cache backend and Next.js Cache Components.

Cache keys must include every result-affecting input. Errors, malformed responses, missing credentials, and authorization failures must not be persisted.

## Client freshness

TanStack Query freshness is defined per resource rather than through one global policy.

| Resource | Stale time | Focus refetch | Reconnect | Polling |
| --- | ---: | :---: | :---: | --- |
| Feed | 30 seconds | Yes | Yes | No |
| Profile ratings | 45 seconds | Yes | Yes | No |
| Media search | 5 minutes | No | Yes | No |
| User search | 2 minutes | No | Yes | No |
| Watch providers | 12 hours | No | Yes | No |
| Rating status | 30 seconds | No | Yes | Mutation-driven |
| Watchlist status | 30 seconds | Yes | Yes | No |
| Unread count | 30 seconds | Yes | Yes | 60 seconds while foregrounded |

Browser query functions must forward TanStack Query abort signals.

## Feed processing

When a user rates media, the web app stores the rating and projects feed entries to followers.

The chronological feed is the canonical feed. It is server-prefetched for the first render and browser-owned afterward.

The queue service provides an alternative feed fan-out path but is not currently the active owner of feed reads.
