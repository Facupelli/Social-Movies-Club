export const LOCAL_STORAGE_KEYS: { [key: string]: string } = {
  PROFILE_TAB_VIEW: 'profile-tab-view',
};

export const NEXT_CACHE_TAGS = {
  getUserWatchlist: (userId: string) => `watchlist:${userId}`,
  getIsFollowingUser: (sessionUserId: string, profileUserId: string) =>
    `is-following-user:${sessionUserId}:${profileUserId}`,
  getIsFollowingUserByProfile: (profileUserId: string) =>
    `is-following-user:profile:${profileUserId}`,
  getIsFollowingUserBySession: (sessionUserId: string) =>
    `is-following-user:session:${sessionUserId}`,
  getUserProfile: (userId: string) => `user-profile:${userId}`,
} as const;
