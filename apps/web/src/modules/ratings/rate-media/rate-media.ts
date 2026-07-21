import 'server-only';

import type {
  MediaType,
  TMDbMediaMultiSearch,
} from '@/modules/media-catalog/media.type';
import type { RateMediaResult } from '@/modules/ratings/rating-mutation.types';
import type { Media } from '@/platform/database/postgres/schema';
import { TmdbService } from '@/platform/tmdb/tmdb.service';
import { projectRatingToFollowerTimelines } from './project-rating-to-timelines';
import { persistRatingMutation } from './rating.pg';

type RateMediaDependencies = {
  tmdb: Pick<TmdbService, 'getMovieDetail' | 'getTvDetail'>;
  persistRatingMutation: typeof persistRatingMutation;
  projectRatingToFollowerTimelines: typeof projectRatingToFollowerTimelines;
};

const defaultDependencies: RateMediaDependencies = {
  tmdb: new TmdbService(),
  persistRatingMutation,
  projectRatingToFollowerTimelines,
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
): Promise<RateMediaResult> {
  // Keep the external lookup outside the database transaction.
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

  const persisted = await dependencies.persistRatingMutation(
    userId,
    mediaData,
    rating,
    watchedDate
  );

  // Feed fan-out is intentionally post-commit and does not delay persistence.
  await dependencies.projectRatingToFollowerTimelines(persisted.rating);

  return {
    mediaIdentity: { tmdbId, type },
    rating: {
      score: persisted.rating.score,
      watchedDate: persisted.rating.watched_date,
    },
    removedFromWatchlist: persisted.removedFromWatchlist,
  };
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
    throw new Error('Media not found');
  }

  return result.data;
}
