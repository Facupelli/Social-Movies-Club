# Ratings

## Purpose

Ratings records what users watched and how strongly they recommend it.

## Business invariants

- A user rates a media item at most once.
- Scores range from 1 through 10.
- Watched dates are non-future calendar dates that default to today.
- Re-rating updates the existing current score and watched date.
- Re-rating preserves the rating creation time and creates no new activity or feed delivery.
- Rating removes media from the watchlist.
- Ratings cannot currently be deleted.
