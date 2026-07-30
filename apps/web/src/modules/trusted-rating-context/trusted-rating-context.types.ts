export type TrustedRater = {
  userId: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  score: number;
  watchedDate: string;
  ratedAt: string;
};

export type TrustedRatingSummary = {
  mediaId: string;
  ratingCount: number;
  averageScore: number | null;
  previewRaters: TrustedRater[];
};

export type TrustedRatingSummaryMap = Record<string, TrustedRatingSummary>;

export type TrustedRatingDetails = {
  summary: TrustedRatingSummary;
  raters: TrustedRater[];
};

export type TrustedRatingRow = {
  mediaId: string;
  ratingCount: number;
  averageScore: string | number;
  previewRaters: TrustedRaterRow[];
};

export type TrustedRaterRow = {
  userId: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  score: number;
  watchedDate: Date | string;
  ratedAt: Date | string;
};

export type TrustedRatingDetailRow = TrustedRaterRow & {
  ratingCount: number;
  averageScore: string | number;
};
