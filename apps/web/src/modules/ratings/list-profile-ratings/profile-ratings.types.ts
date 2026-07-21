import type { MediaType } from '@/modules/media-catalog/media.type';
import type { MovieView } from '@/modules/media-catalog/movie-view';

export type UserRatings = {
  movieId: string;
  score: number;
  watchedDate: string;
  createdAt: Date;
  title: string;
  year: string;
  posterPath: string;
  backdropPath: string;
  overview: string;
  tmdbId: number;
  type: MediaType;
  runtime?: number;
};

export interface GetUserRatingMovies {
  data: UserRatings[];
  nextCursor: number | null;
}

export type ProfileRatingsSortBy = 'score' | 'createdAt';
export type ProfileRatingsSortOrder = 'asc' | 'desc';
export type ProfileRatingsTypeFilter = 'all' | MediaType;

export type ProfileRatingsFilters = Readonly<{
  sortBy: ProfileRatingsSortBy;
  sortOrder: ProfileRatingsSortOrder;
  typeFilter: ProfileRatingsTypeFilter;
  bothRated: boolean;
}>;

export type ProfileRatingsRepositoryFilters = ProfileRatingsFilters &
  Readonly<{ limit: number; offset: number }>;

export type ProfileRatingsPage = Readonly<{
  data: MovieView[];
  nextPage: number | null;
}>;
