import {
  type EnrichedWatchlistItem,
  WATCHLIST_SORTS,
  type WatchlistSort,
} from '@/modules/watchlist/watchlist.types';

export const DEFAULT_WATCHLIST_SORT: WatchlistSort = 'recently-added';

export function parseWatchlistSort(
  value: string | string[] | undefined
): WatchlistSort {
  return typeof value === 'string' &&
    WATCHLIST_SORTS.includes(value as WatchlistSort)
    ? (value as WatchlistSort)
    : DEFAULT_WATCHLIST_SORT;
}

export function sortWatchlistItems(
  items: readonly EnrichedWatchlistItem[],
  sort: WatchlistSort
): EnrichedWatchlistItem[] {
  return [...items].sort((left, right) => {
    if (sort === 'trusted-rating') {
      const ratedComparison = compareRatedFirst(left, right);
      if (ratedComparison !== 0) {
        return ratedComparison;
      }

      const averageComparison =
        (right.trustedRating.averageScore ?? 0) -
        (left.trustedRating.averageScore ?? 0);
      if (averageComparison !== 0) {
        return averageComparison;
      }

      const countComparison =
        right.trustedRating.ratingCount - left.trustedRating.ratingCount;
      if (countComparison !== 0) {
        return countComparison;
      }
    }

    if (sort === 'most-rated') {
      const ratedComparison = compareRatedFirst(left, right);
      if (ratedComparison !== 0) {
        return ratedComparison;
      }

      const countComparison =
        right.trustedRating.ratingCount - left.trustedRating.ratingCount;
      if (countComparison !== 0) {
        return countComparison;
      }

      const averageComparison =
        (right.trustedRating.averageScore ?? 0) -
        (left.trustedRating.averageScore ?? 0);
      if (averageComparison !== 0) {
        return averageComparison;
      }
    }

    const dateComparison =
      new Date(right.addedAt).getTime() - new Date(left.addedAt).getTime();
    return dateComparison || right.mediaId.localeCompare(left.mediaId);
  });
}

function compareRatedFirst(
  left: EnrichedWatchlistItem,
  right: EnrichedWatchlistItem
): number {
  return (
    Number(right.trustedRating.ratingCount > 0) -
    Number(left.trustedRating.ratingCount > 0)
  );
}
