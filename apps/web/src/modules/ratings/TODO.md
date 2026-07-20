# Ratings TODO

- [x] Add watched date
  Store a non-future calendar date that defaults to today.

- [ ] Add watched-date editing
  Correcting it must not create timeline activity.

- [x] Preserve watched date when re-rating
  Re-rating changes only score and activity time.

- [x] Add database score constraints
  Enforce the 1 through 10 range.

- [ ] Split the mixed user repository
  Move rating operations into their slices.
