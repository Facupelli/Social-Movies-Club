# Modules

Organize product behavior by business capability and use-case folder.

Each use-case should expose named functions. Use classes only when instance state or lifecycle is required.

Conventions:

- Use the feature-named file for business rules and orchestration.
- Use `*.pg.ts` for PostgreSQL queries and commands.
- Use `*.types.ts`, `*.validation.ts`, and `*.adapters.ts` only when needed.
- Call persistence functions directly when a separate use-case layer would only delegate.
- Inject dependencies into orchestration functions only when substitution is useful.
- Keep framework infrastructure in `platform` and reusable presentation or utilities in `shared`.
