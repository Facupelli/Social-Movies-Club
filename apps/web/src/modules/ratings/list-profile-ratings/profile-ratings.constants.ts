export const PROFILE_RATINGS_VIEW_STORAGE_KEY = 'profile-tab-view' as const;

export const PROFILE_RATINGS_GRID_CLASS_NAME =
  'grid-cols-[repeat(auto-fill,minmax(min(100%,8.5rem),1fr))] gap-3';

export const PROFILE_RATINGS_VIEWS = {
  grid: 'grid',
  list: 'list',
} as const;

export type ProfileRatingsView =
  (typeof PROFILE_RATINGS_VIEWS)[keyof typeof PROFILE_RATINGS_VIEWS];
