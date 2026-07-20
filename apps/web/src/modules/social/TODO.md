# Social TODO

- [x] Correct following-list button state
  Show whether the viewer follows each user.

- [x] Reject self-following
  Enforce it in the use case and database.

- [x] Stop swallowing follow failures
  Persistence failures must not report success.

- [ ] Split follow queries by use case
  Separate list, summary, and status operations.
