# Ratings

## Purpose

Ratings records what users watched and how strongly they recommend it.

## Business invariants

- A user rates a media item at most once.
- Scores range from 1 through 10.
- Re-rating changes the existing score.
- Rating removes media from the watchlist.
- Ratings cannot currently be deleted.
