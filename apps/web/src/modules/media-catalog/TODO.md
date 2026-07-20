# Media Catalog TODO

- [ ] Fix media identity
  Replace global TMDB ID uniqueness with `(tmdbId, type)`.

- [ ] Include media type in every lookup
  Upsert and retrieval currently use TMDB ID alone.

- [ ] Remove unused MongoDB infrastructure
  Confirm it has no deployed consumer first.
