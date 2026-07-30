import { cache } from 'react';
import type { MediaKind } from '@/modules/media-catalog/media.type';
import { TmdbService } from '@/platform/tmdb/tmdb.service';

const tmdb = new TmdbService();

/** Deduplicates identical TMDB detail reads during one server render. */
export const getMediaDetail = cache(async (tmdbId: number, kind: MediaKind) => {
  return await tmdb.getMediaDetail(tmdbId, kind);
});
