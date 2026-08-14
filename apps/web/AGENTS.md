# Web App

The web app is the main Que Ves product. It lets users score movies and TV shows, follow people they trust, and discover what to watch through a social feed.

Before working on a task, consult:

- `../../docs/constitution/mission.md` for product decisions.
- `../../docs/architecture/overview.md` for architecture and data flows.
- `../../docs/constitution/tech-stack.md` for technology choices.

When building or modifying user interfaces, also read `design-system.md` and follow its visual and interaction guidance. Do not read it for tasks that do not affect the UI.

Use nearby feature code and configuration for task-specific conventions. From this directory, prefer app-local commands such as `pnpm dev` and `pnpm build`.

After changing code, run pnpm fix, then pnpm validate.
fix formats code and applies Biome safe fixes. validate checks Biome and TypeScript without modifying files.

Use pnpm lint or pnpm format only when diagnosing lint or formatting problems. Run relevant tests when behavior changes. Do not use Biome unsafe fixes unless explicitly requested.
