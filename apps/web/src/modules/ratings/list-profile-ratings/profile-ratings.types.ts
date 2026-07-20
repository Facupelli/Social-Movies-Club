import type { MediaType } from '@/modules/media-catalog/media.type';

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

export type UserMoviesBothRatedFilter = 'true' | 'false';
export type UserMoviesTypeFilter = 'all' | 'movie' | 'tv';
export type UserMoviesSortBy = 'score' | 'createdAt';
export type UserMoviesSortOrder = 'asc' | 'desc';

export interface UserMoviesClientFilters {
  sortBy?: UserMoviesSortBy;
  sortOrder?: UserMoviesSortOrder;
  typeFilter?: UserMoviesTypeFilter;
  bothRated?: boolean;
}

export interface UserMoviesServerFilters extends UserMoviesClientFilters {
  limit?: number;
  offset?: number;
}

export interface UserMoviesUrlParams {
  sortBy?: string;
  sortOrder?: string;
  type?: string;
  bothRatedFilter?: string;
}
