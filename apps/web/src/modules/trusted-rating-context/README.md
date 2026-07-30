# Trusted Rating Context

## Purpose

Trusted Rating Context is the current opinion of a viewer's trusted network about local media. It is a reusable projection consumed by Search, Detail, and Watchlist, with Timeline integration remaining separate.

## Source of truth

- Current directed relationships in `follows` determine whom the viewer trusts.
- Current rows in `ratings` determine each person's score.
- `user_profiles`, with `users.name` as the display-name fallback, supplies identity.
- Media is identified only by `media.id`.
- Feed deliveries and activities never determine trusted-rating membership.

## Business invariants

- Only users currently followed by the viewer contribute.
- The viewer never contributes to their own trusted context.
- Following makes all of a person's existing current ratings eligible immediately without backfilling the Timeline.
- Unfollowing removes the person's ratings immediately without deleting delivered Timeline entries.
- Rating updates change the current score and aggregate but do not change rating recency.
- Recency is `ratings.created_at DESC`, with `ratings.id DESC` as a deterministic tie-breaker.
- Watched date and update time do not determine social recency.
- A missing profile or avatar does not remove a rating from an aggregate.
- No qualifying ratings means a count of zero and a null average, never an average of zero.

## Projections

A summary contains the rating count, arithmetic average, and at most the three most recent raters. Batch summary loading uses one database query and does not retrieve every rater.

Details contain the same summary and the complete ordered list of current followed raters for one media item.

Trusted Rating Context is derived and is not persistently cached or materialized.

Search results are matched to existing local media in one batch through TMDB external identities. Unmatched results remain external-only and are never persisted merely because they appeared in Search.
