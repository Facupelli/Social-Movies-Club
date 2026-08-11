export type RecommendationCursor = {
  supporterCount: number;
  averageScore: string;
  ratingCount: number;
  latestWatchedDate: string;
  mediaId: string;
};

export type GetUserRecommendationsParams = {
  userId: string;
  limit?: number;
  cursor?: RecommendationCursor | null;
};

export type TrustedRatingContext = {
  userId: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  score: number;
  watchedDate: string;
};

export type RecommendationItem = {
  movieId: string;
  movieTmdbId: number;
  movieTitle: string;
  movieYear: string;
  moviePoster: string;
  movieBackdrop: string;
  movieRuntimeMinutes: number | null;
  movieOverview: string;
  kind: 'movie' | 'tv_series';

  ratingCount: number;
  supporterCount: number;
  averageScore: number;
  latestWatchedDate: string;

  trustedRatingContext: TrustedRatingContext[];
};

export type UserRecommendationsPage = {
  items: RecommendationItem[];
  nextCursor: string | null;
};
