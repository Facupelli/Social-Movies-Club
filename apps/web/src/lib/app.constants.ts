export const LOCAL_STORAGE_KEYS: { [key: string]: string } = {
  PROFILE_TAB_VIEW: "profile-tab-view",
};

export const QUERY_KEYS = {
  USER: ["user"],
  USER_FEED: ["user-feed"],
  USER_RATINGS: ["user-ratings"],
  getUserMovies: (userId: string) => ["user-movies", { userId }],
} as const;
