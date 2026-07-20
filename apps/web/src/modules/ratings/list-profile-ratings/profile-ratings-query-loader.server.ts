import 'server-only';

import { dbMovieToView } from '@/modules/media-catalog/get-media-details/media.adapters';
import type { MovieView } from '@/modules/media-catalog/movie-view';
import { getUserRatingMovies } from './profile-ratings.pg';
import type { UserMoviesServerFilters } from './profile-ratings.types';

export type UserMoviesPage = {
  data: MovieView[];
  nextCursor: number | null;
};

export async function loadUserMoviesPage({
  profileUserId,
  viewerUserId,
  filters,
}: {
  profileUserId: string;
  viewerUserId: string;
  filters: UserMoviesServerFilters;
}): Promise<UserMoviesPage> {
  const result = await getUserRatingMovies(
    profileUserId,
    filters,
    viewerUserId
  );

  return {
    data: result.data.map(dbMovieToView),
    nextCursor: result.nextCursor,
  };
}
