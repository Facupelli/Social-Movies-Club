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

export type TimelineTrustedRatingContext = {
  summary: TrustedRatingSummary;
  otherPreviewRaters: TrustedRater[];
  otherRaterCount: number;
  actorIsCurrentlyTrusted: boolean;
};

export type TimelineTrustedRatingContextMap = Record<
  string,
  TimelineTrustedRatingContext
>;

export type TimelineTrustedRatingContextRow = {
  mediaId: string;
  actorId: string;
  ratingCount: number;
  averageScore: string | number | null;
  actorIsCurrentlyTrusted: boolean;
  otherRaterCount: number;
  previewRaters: TrustedRaterRow[];
  otherPreviewRaters: TrustedRaterRow[];
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
