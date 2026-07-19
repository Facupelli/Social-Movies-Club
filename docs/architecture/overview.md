# Architecture Overview

Social Movies Club is a pnpm workspace monorepo managed with Turborepo.

## Applications

- `apps/web`: Next.js App Router application containing the UI, route handlers, server actions, authentication, and core domain logic.
- `apps/queue-system`: NestJS and BullMQ service intended to process feed fan-out jobs.

## Data flow

TMDB supplies movie, TV, and watch-provider metadata. TMDB responses are cached in Vercel KV.

Neon PostgreSQL is the system of record. Drizzle manages users, media, ratings, follows, feeds, watchlists, and notifications.

When a user rates media, the web app stores the rating and creates feed entries for followers. This currently runs from the web app with background continuation. The queue service provides an alternative fan-out path that is not yet active.

The browser accesses application data through Next.js route handlers, server actions, and TanStack Query hooks.
