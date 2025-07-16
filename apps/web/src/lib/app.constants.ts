import type { UserMoviesSortBy, UserMoviesSortOrder } from "@/users/user.types";

export const LOCAL_STORAGE_KEYS: { [key: string]: string } = {
  PROFILE_TAB_VIEW: "profile-tab-view",
};

export const QUERY_KEYS = {
  USER: ["user"],
  USER_FEED: ["user-feed"],
  USER_RATINGS: ["user-ratings"],
  USER_WATCHLIST: ["user-watchlist"],
  getUserMovies: (
    userId: string,
    sortBy: UserMoviesSortBy | null,
    sortOrder: UserMoviesSortOrder | null
  ) => ["user-movies", { userId }, { sortBy }, { sortOrder }],
} as const;
