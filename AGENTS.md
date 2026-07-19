# Agent Context

Monorepo for Social Movies Club, a social movie and TV discovery platform built around ratings from people users trust.

Use pnpm workspaces and Turborepo.

Workspace commands:

- `pnpm build`
- `pnpm lint`
- `pnpm format`
- `pnpm test`
- `pnpm check-types`

Prefer app-local commands when changing one application. Use root workspace commands for cross-workspace changes.

Top-level structure:

- `apps/web/` contains the main Next.js application.
- `apps/queue-system/` contains the NestJS feed-processing service.
- `packages/` is reserved for shared workspace packages.
- `docs/` contains product and technical documentation.

When working in the web app, follow `apps/web/AGENTS.md`.

Start with:

- `docs/constitution/mission.md` for product intent.
- `docs/architecture/overview.md` for system boundaries and data flows.
- `docs/constitution/tech-stack.md` for approved technologies.

Use nearby code and configuration as the source of truth for implementation details.
