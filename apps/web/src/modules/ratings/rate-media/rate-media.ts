import { revalidateTag } from 'next/cache';
import { upsertMedia } from '@/modules/media-catalog/get-media-details/media.pg';
import type {
  MediaType,
  TMDbMediaMultiSearch,
} from '@/modules/media-catalog/media.type';
import { isMediaInWatchlist } from '@/modules/watchlist/get-watchlist-status/watchlist-status.pg';
import { removeFromWatchlist } from '@/modules/watchlist/remove-from-watchlist/remove-from-watchlist.pg';
import type { Media } from '@/platform/database/postgres/schema';
import { TmdbService } from '@/platform/tmdb/tmdb.service';
import { NEXT_CACHE_TAGS } from '@/shared/utilities/app.constants';
import { projectRatingToFollowerTimelines } from './project-rating-to-timelines';
import { upsertRating } from './rating.pg';

type RateMediaDependencies = {
  tmdb: Pick<TmdbService, 'getMovieDetail' | 'getTvDetail'>;
  upsertMedia: typeof upsertMedia;
  upsertRating: typeof upsertRating;
  projectRatingToFollowerTimelines: typeof projectRatingToFollowerTimelines;
  isMediaInWatchlist: typeof isMediaInWatchlist;
  removeFromWatchlist: typeof removeFromWatchlist;
  revalidateTag: typeof revalidateTag;
};

const defaultDependencies: RateMediaDependencies = {
  tmdb: new TmdbService(),
  upsertMedia,
  upsertRating,
  projectRatingToFollowerTimelines,
  isMediaInWatchlist,
  removeFromWatchlist,
  revalidateTag,
};

export async function rateMedia(
  {
    userId,
    tmdbId,
    rating,
    type,
    watchedDate,
  }: {
    userId: string;
    tmdbId: number;
    rating: number;
    type: MediaType;
    watchedDate: string;
  },
  dependencies: RateMediaDependencies = defaultDependencies
): Promise<void> {
  const media = await getMediaDetail(tmdbId, type, dependencies.tmdb);
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

  const { id: mediaId } = await dependencies.upsertMedia(mediaData);
  const persistedRating = await dependencies.upsertRating(
    userId,
    mediaId,
    rating,
    watchedDate
  );

  // biome-ignore lint/suspicious/noConsole: preserve rating persistence diagnostics
  console.log(`✅ Rating created/updated: ${persistedRating.id}`);

  await dependencies.projectRatingToFollowerTimelines(persistedRating);

  if (await dependencies.isMediaInWatchlist(userId, mediaId)) {
    await dependencies.removeFromWatchlist(userId, mediaId);
    dependencies.revalidateTag(NEXT_CACHE_TAGS.getUserWatchlist(userId), 'max');
  }
}

async function getMediaDetail(
  tmdbId: number,
  type: MediaType,
  tmdb: Pick<TmdbService, 'getMovieDetail' | 'getTvDetail'>
): Promise<TMDbMediaMultiSearch> {
  const result =
    type === 'movie'
      ? await tmdb.getMovieDetail(tmdbId)
      : await tmdb.getTvDetail(tmdbId);

  if (!result.data) {
    throw new Error('Invalid media type');
  }

  return result.data;
}
