import type {
  MediaKind,
  TMDbMediaMultiSearch,
} from '@/modules/media-catalog/media.type';
import {
  type MultiSearchResult,
  type SearchMoviesResult,
  TmdbRepository,
} from '@/platform/tmdb/tmdb.repository';
import { toTmdbMediaType } from '@/platform/tmdb/tmdb-media-kind';
import type {
  TmdbMediaAvailability,
  TmdbProviderCatalogue,
} from '@/platform/tmdb/types/streaming';

export class TmdbService {
  constructor(
    private readonly repo: TmdbRepository = new TmdbRepository(
      process.env.TMDB_ACCESS_TOKEN as string
    )
  ) {}

  async multiSearch(query: string): Promise<MultiSearchResult> {
    return await this.repo.multiSearch({
      query: query.trim(),
    });
  }

  async searchMovie(query: string): Promise<SearchMoviesResult> {
    return await this.repo.searchMovies({
      query,
    });
  }

  async getMovieDetail(
    movieId: number
  ): Promise<{ data: TMDbMediaMultiSearch }> {
    return await this.repo.getMovieDetail(movieId);
  }

  async getTvDetail(movieId: number): Promise<{ data: TMDbMediaMultiSearch }> {
    return await this.repo.getTvDetail(movieId);
  }

  async getMediaDetail(
    mediaId: number,
    kind: MediaKind
  ): Promise<{ data: TMDbMediaMultiSearch }> {
    return toTmdbMediaType(kind) === 'movie'
      ? await this.repo.getMovieDetail(mediaId)
      : await this.repo.getTvDetail(mediaId);
  }

  async getWatchProvidersForRegion(
    countryCode: string,
    kind: MediaKind
  ): Promise<TmdbProviderCatalogue> {
    return await this.repo.getWatchProvidersForRegion(
      countryCode,
      toTmdbMediaType(kind)
    );
  }

  async getMediaWatchProviders(
    mediaId: number,
    kind: MediaKind
  ): Promise<TmdbMediaAvailability> {
    return await this.repo.getMediaWatchProviders(
      mediaId,
      toTmdbMediaType(kind)
    );
  }
}
