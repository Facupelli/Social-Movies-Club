import type { WatchProviderResponse } from '@/modules/media-catalog/get-watch-providers/watch-provider.types';
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

  async getWatchProvider(
    mediaId: number,
    kind: MediaKind
  ): Promise<WatchProviderResponse> {
    return toTmdbMediaType(kind) === 'movie'
      ? await this.repo.getMovieWatchProviders(mediaId)
      : await this.repo.getTvWatchProviders(mediaId);
  }
}
