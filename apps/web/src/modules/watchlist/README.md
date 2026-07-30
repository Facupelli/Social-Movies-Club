# Watchlist

## Purpose

Watchlist tracks media a user intends to watch.

## Business invariants

- Media appears at most once per watchlist.
- Only the owner may modify a watchlist.
- Authenticated users may view another user watchlist.
- Rating removes media from the owner watchlist.
- Trusted rating context is always relative to the current viewer, including when viewing another profile's watchlist.
- Watchlists default to recently added and may be sorted by trusted average or trusted rating count.
- Trusted summary enrichment is batched across all media in the rendered watchlist.
