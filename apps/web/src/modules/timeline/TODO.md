# Timeline TODO

- [ ] Correct re-rating projection
  Update current followers while preserving former followers snapshots.

- [ ] Make rating and fan-out atomic
  Remove the current failure window.

- [ ] Add stable pagination
  Use activity time and ID as the cursor.

- [ ] Remove aggregated-feed experiments
  Delete inactive code and tables after confirming they are unused.

- [ ] Isolate future queue integration
  Keep one active fan-out path until deployment.
