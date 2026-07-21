# Ratings

## Purpose

Ratings records what users watched and how strongly they recommend it.

## Business invariants

- A user rates a media item at most once.
- Scores range from 1 through 10.
- Watched dates are non-future calendar dates that default to today.
- Re-rating changes the existing score and activity time without changing the watched date.
- Rating removes media from the watchlist.
- Ratings cannot currently be deleted.
