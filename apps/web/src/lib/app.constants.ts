export const LOCAL_STORAGE_KEYS: { [key: string]: string } = {
  PROFILE_TAB_VIEW: "profile-tab-view",
};

interface QueryKeys {
  USER: string[];
  USER_FEED: string[];
  USER_RATINGS: string[];
  getUserMovies: (userId: string) => [string, { userId: string }];
}

// For dynamic querys use query-facotries
export const QUERY_KEYS: QueryKeys = {
  USER: ["user"],
  USER_FEED: ["user-feed"],
  USER_RATINGS: ["user-ratings"],
  getUserMovies: (userId) => ["user-movies", { userId }],
};
