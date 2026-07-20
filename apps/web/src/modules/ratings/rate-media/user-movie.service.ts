import { revalidateTag } from 'next/cache';
import { MediaService } from '@/modules/media-catalog/get-media-details/media.service';
import type {
  MediaType,
  TMDbMediaMultiSearch,
} from '@/modules/media-catalog/media.type';
import { addToWatchlist } from '@/modules/watchlist/add-to-watchlist/add-to-watchlist.pg';
import { isMediaInWatchlist } from '@/modules/watchlist/get-watchlist-status/watchlist-status.pg';
import { removeFromWatchlist } from '@/modules/watchlist/remove-from-watchlist/remove-from-watchlist.pg';
import type { Media } from '@/platform/database/postgres/schema';
import { TmdbService } from '@/platform/tmdb/tmdb.service';
import { NEXT_CACHE_TAGS } from '@/shared/utilities/app.constants';
import { RatingPgRepository } from './rating.pg.repository';

export class UserMediaService {
  constructor(
    private readonly mediaService = new MediaService(),
    private readonly ratingRepository = new RatingPgRepository(),
    private readonly tmdbService = new TmdbService()
  ) {}

  async rateMovie({
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
  }): Promise<void> {
    const media = await this.getMediaDetail(tmdbId, type);

    const movieData: Omit<Media, 'id'> = {
      posterPath: media.posterPath,
      backdropPath: media.backdropPath,
      title: media.title,
      year: media.year,
      tmdbId: media.id,
      overview: media.overview,
      type,
      runtime: media.runtime ?? null,
    };

    const { id: mediaId } = await this.mediaService.upsertMedia(movieData);

    await this.ratingRepository.rateMovie(userId, mediaId, rating, watchedDate);

    const isInWatchList = await isMediaInWatchlist(userId, mediaId);
    if (isInWatchList) {
      await removeFromWatchlist(userId, mediaId);
      revalidateTag(NEXT_CACHE_TAGS.getUserWatchlist(userId));
    }
  }

  async addMediaToWatchlist(userId: string, tmdbId: number, type: MediaType) {
    const media = await this.getMediaDetail(tmdbId, type);

    const movieData: Omit<Media, 'id'> = {
      posterPath: media.posterPath,
      backdropPath: media.backdropPath,
      title: media.title,
      year: media.year,
      tmdbId: media.id,
      overview: media.overview,
      type,
      runtime: media.runtime ?? null,
    };

    const { id: movieId } = await this.mediaService.upsertMedia(movieData);

    return addToWatchlist(userId, movieId);
  }

  private async getMediaDetail(
    tmdbId: number,
    type: MediaType
  ): Promise<TMDbMediaMultiSearch> {
    let data: { data: TMDbMediaMultiSearch } | undefined;

    if (type === 'movie') {
      data = await this.tmdbService.getMovieDetail(tmdbId);
    } else if (type === 'tv') {
      data = await this.tmdbService.getTvDetail(tmdbId);
    }

    if (!data?.data) {
      throw new Error('Invalid media type');
    }

    return data.data;
  }
}
