# Notifications TODO

- [ ] Add follow-notification idempotency
  One follow operation must not create duplicates.

- [x] Use stable pagination
  Apply timestamp and ID from the cursor.

- [ ] Standardize error handling
  Failures must not silently become empty results.

- [ ] Split persistence by use case
  Separate read and write operations.
