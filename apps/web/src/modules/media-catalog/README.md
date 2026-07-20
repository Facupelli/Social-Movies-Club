# Media Catalog

## Purpose

Media Catalog finds movie and TV metadata and persists media referenced by users.

## Business invariants

- Movies and TV series are supported.
- TMDB is the external metadata source.
- Search results are cached but persisted only after user interaction.
- Media identity includes media type and TMDB ID.
