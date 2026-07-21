# Watchlist

## Purpose

Watchlist tracks media a user intends to watch.

## Business invariants

- Media appears at most once per watchlist.
- Only the owner may modify a watchlist.
- Authenticated users may view another user watchlist.
- Rating removes media from the owner watchlist.
