import 'server-only';

import { upsertMedia } from '@/modules/media-catalog/get-media-details/media.pg';
import type { MediaType } from '@/modules/media-catalog/media.type';
import { addToWatchlist } from '@/modules/watchlist/add-to-watchlist/add-to-watchlist.pg';
import { removeFromWatchlistByIdentity } from '@/modules/watchlist/remove-from-watchlist/remove-from-watchlist.pg';
import type { WatchlistMutationResult } from '@/modules/watchlist/watchlist.types';
import type { Media } from '@/platform/database/postgres/schema';
import { TmdbService } from '@/platform/tmdb/tmdb.service';

export async function addMediaToViewerWatchlist(
  userId: string,
  tmdbId: number,
  type: MediaType
): Promise<WatchlistMutationResult> {
  const tmdb = new TmdbService();
  const result =
    type === 'movie'
      ? await tmdb.getMovieDetail(tmdbId)
      : await tmdb.getTvDetail(tmdbId);
  const media = result.data;

  if (!media) {
    throw new Error('Media not found');
  }

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

  return { tmdbId, type, inWatchlist: true };
}

export async function removeMediaFromViewerWatchlist(
  userId: string,
  tmdbId: number,
  type: MediaType
): Promise<WatchlistMutationResult> {
  await removeFromWatchlistByIdentity(userId, tmdbId, type);
  return { tmdbId, type, inWatchlist: false };
}
