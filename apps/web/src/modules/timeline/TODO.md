# Timeline TODO

- [ ] Correct re-rating projection
  Update current followers while preserving former followers snapshots.

- [ ] Make rating and fan-out atomic
  Remove the current failure window.

- [ ] Add stable pagination
  Use activity time and ID as the cursor.

- [ ] Isolate future queue integration
  Keep one active fan-out path until deployment.
