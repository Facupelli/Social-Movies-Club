# Timeline

## Purpose

Timeline shows recent ratings from people the viewer follows.

## Business invariants

- Viewers never receive their own ratings.
- Following does not backfill earlier rating activity into the Timeline.
- Unfollowing preserves existing delivered entries.
- Only activity during an active follow is delivered.
- Entries represent individual rating activities and retain their original position.
- A delivered entry reads the rating's current score because ratings are authoritative and no historical score snapshot exists.
- Trusted Rating Context is current-network data and is not derived from Timeline deliveries.
