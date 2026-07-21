'use server';

import { revalidateTag } from 'next/cache';
import { upsertMedia } from '@/modules/media-catalog/get-media-details/media.pg';
import type {
  MediaType,
  TMDbMediaMultiSearch,
} from '@/modules/media-catalog/media.type';
import { addToWatchlist } from '@/modules/watchlist/add-to-watchlist/add-to-watchlist.pg';
import { validateAddMovieToWatchlist } from '@/modules/watchlist/watchlist-validation';
import { withAuth } from '@/platform/auth/auth-server-action.middleware';
import type { Media } from '@/platform/database/postgres/schema';
import { TmdbService } from '@/platform/tmdb/tmdb.service';
import { type ApiResponse, execute } from '@/shared/http/safe-execute';
import { NEXT_CACHE_TAGS } from '@/shared/utilities/app.constants';

export async function addMovieToWatchlist(
  formData: FormData
): Promise<ApiResponse<void>> {
  return await withAuth(async (session) => {
    const { movieTMDBId, userId, type } = validateAddMovieToWatchlist(formData);

    if (userId !== session.user.id) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const result = await execute<void>(async () => {
      await addMediaToWatchlist(userId, movieTMDBId, type);
    });

    if (result.success) {
      revalidateTag(NEXT_CACHE_TAGS.getUserWatchlist(userId), 'max');
    }

    return result;
  });
}

async function addMediaToWatchlist(
  userId: string,
  tmdbId: number,
  type: MediaType
): Promise<void> {
  const tmdb = new TmdbService();
  const result =
    type === 'movie'
      ? await tmdb.getMovieDetail(tmdbId)
      : await tmdb.getTvDetail(tmdbId);
  const media = getMediaDetail(result);
  const mediaData: Omit<Media, 'id'> = {
    posterPath: media.posterPath,
    backdropPath: media.backdropPath,
    title: media.title,
    year: media.year,
    tmdbId: media.id,
    overview: media.overview,
    type,
    runtime: media.runtime ?? null,
  };

  const { id: mediaId } = await upsertMedia(mediaData);
  await addToWatchlist(userId, mediaId);
}

function getMediaDetail(result: {
  data: TMDbMediaMultiSearch;
}): TMDbMediaMultiSearch {
  if (!result.data) {
    throw new Error('Invalid media type');
  }

  return result.data;
}
