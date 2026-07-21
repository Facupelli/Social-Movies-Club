export const NEXT_CACHE_TAGS = {
  getUserWatchlist: (userId: string) => `watchlist:${userId}`,
} as const;
