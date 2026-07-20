# Watchlist TODO

- [ ] Make rating removal atomic
  Commit removal with rating and timeline projection.

- [x] Include media type in removal lookups
  TMDB ID alone is not unique across movies and TV.

- [x] Separate list and status persistence
  Move data access into each slice.
