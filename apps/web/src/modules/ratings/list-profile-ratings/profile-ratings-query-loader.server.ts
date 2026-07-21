import 'server-only';

import { dbMovieToView } from '@/modules/media-catalog/get-media-details/media.adapters';
import { getUserRatingMovies } from './profile-ratings.pg';
import type {
  ProfileRatingsPage,
  ProfileRatingsRepositoryFilters,
} from './profile-ratings.types';

/** Application service shared by the Server Component and Route Handler. */
export async function loadProfileRatingsPage({
  profileUserId,
  viewerUserId,
  filters,
}: {
  profileUserId: string;
  viewerUserId: string;
  filters: ProfileRatingsRepositoryFilters;
}): Promise<ProfileRatingsPage> {
  const result = await getUserRatingMovies(
    profileUserId,
    filters,
    viewerUserId
  );

  return {
    data: result.data.map(dbMovieToView),
    nextPage: result.nextCursor,
  };
}
