export const PROFILE_RATINGS_VIEW_STORAGE_KEY = 'profile-tab-view' as const;

export const PROFILE_RATINGS_VIEWS = {
  grid: 'grid',
  list: 'list',
} as const;

export type ProfileRatingsView =
  (typeof PROFILE_RATINGS_VIEWS)[keyof typeof PROFILE_RATINGS_VIEWS];
