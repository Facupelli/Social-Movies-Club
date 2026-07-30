# Modules

Organize product behavior by business capability. Within a module, organize code primarily into vertical use-case slices rather than technical layers.

## Structure

A module may contain:

```text
<module>/
├── README.md
├── <shared-domain-file>.ts
├── <use-case>/
│   ├── <use-case>.ts
│   ├── <use-case>.pg.ts
│   ├── <use-case>.types.ts
│   ├── <use-case>.test.ts
│   ├── <use-case>.pg.test.ts
│   ├── use-<use-case>.ts
│   └── <use-case-view>.tsx
└── components/
    └── <shared-component>.tsx
```

This is a menu, not a required set of files. Keep a small use case in one focused file until supporting persistence, validation, browser state, UI, or tests make a folder useful.

## Ownership

- A use-case slice owns its orchestration, persistence, validation, slice-specific types, browser integration, UI, and tests.
- Keep code at the module root only when it represents a domain concept genuinely shared by multiple slices.
- Put presentation in a module-level `components` folder only when multiple slices consume it.
- Do not create broad module-wide persistence, type, or test files that collect unrelated slice responsibilities.
- The folder structure is the concrete map of a module's use cases. Do not duplicate that inventory in its README.

## Dependencies

- Import a capability from the specific slice that owns it. Do not add module barrel files.
- Slices may depend on shared domain concepts at their module root.
- Cross-module dependencies must point to the owning module and slice rather than copy behavior.
- Keep framework infrastructure in `platform` and broadly reusable presentation or utilities in `shared`.

## Implementation conventions

- Expose named functions. Use classes only when instance state or lifecycle is required.
- Use the use-case-named file for business rules and orchestration.
- Use `*.pg.ts` for PostgreSQL queries and commands owned by that slice.
- Use `*.types.ts`, `*.validation.ts`, and `*.adapters.ts` only when needed.
- Call persistence functions directly when a separate orchestration layer would only delegate.
- Inject dependencies into orchestration functions only when substitution is useful.
