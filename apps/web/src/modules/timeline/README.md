# Timeline

## Purpose

Timeline shows historically delivered rating-created activities. Each entry keeps its original position while displaying the rating author's current score.

## Business invariants

- Viewers never receive their own ratings.
- Following does not backfill earlier rating activity into the Timeline.
- Unfollowing preserves existing delivered entries.
- Only activity during an active follow is delivered.
- Entries represent individual rating activities and retain their original position.
- A delivered entry reads the rating's current score because ratings are authoritative and no historical score snapshot exists.
- Trusted Rating Context is current-network data and is not derived from Timeline deliveries.
- Timeline enrichment is loaded in one batch per feed page and may fail without hiding historical entries.
- Supplemental raters exclude the entry actor, while the canonical trusted average includes that actor when they are still followed.
