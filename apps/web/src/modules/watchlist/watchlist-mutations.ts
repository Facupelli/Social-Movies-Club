import 'server-only';

import { upsertMedia } from '@/modules/media-catalog/get-media-details/media.pg';
import {
  mediaTypeToKind,
  type MediaType,
  type PersistMediaInput,
} from '@/modules/media-catalog/media.type';
import { addToWatchlist } from '@/modules/watchlist/add-to-watchlist/add-to-watchlist.pg';
import { removeFromWatchlistByIdentity } from '@/modules/watchlist/remove-from-watchlist/remove-from-watchlist.pg';
import type { WatchlistMutationResult } from '@/modules/watchlist/watchlist.types';
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

  const mediaData: PersistMediaInput = {
    tmdbId: media.id,
    kind: mediaTypeToKind(type),
    title: media.title,
    originalTitle: media.originalTitle ?? null,
    releaseDate: media.releaseDate ?? null,
    runtimeMinutes: media.runtime ?? null,
    overview: media.overview || null,
    posterPath: media.posterPath || null,
    backdropPath: media.backdropPath || null,
    sourceSyncedAt: new Date(),
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
