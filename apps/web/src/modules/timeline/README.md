# Timeline

## Purpose

Timeline shows recent ratings from people the viewer follows.

## Business invariants

- Viewers never receive their own ratings.
- Following does not backfill earlier ratings.
- Unfollowing preserves existing entries.
- Only activity during an active follow is delivered.
- Entries represent individual ratings.
