import type {
  MediaType,
  TMDbMediaMultiSearch,
  TMDbMovieSearch,
} from '@/modules/media-catalog/media.type';
import { cache } from '@/platform/cache/cache';
import type { MovieDetailApiResponse } from '@/platform/tmdb/types/detail-movie';
import type { SerieDetailApiResponse } from '@/platform/tmdb/types/detail-serie';
import type {
  MediaResult,
  MultiSearchApiResponse,
  TvResult,
} from '@/platform/tmdb/types/multi-search';
import type {
  SearchMovieApiResponse,
  SearchMovieQueryParams,
  SearchMovieResult,
} from '@/platform/tmdb/types/search-movie';
import type {
  TvShowSearchResponse,
  TvShowSummary,
} from '@/platform/tmdb/types/search-tv';
import type {
  WatchProviderApiResponse,
  WatchProviderResult,
} from '@/platform/tmdb/types/watch-provider';

interface ITmdbRepository {
  searchMovies(params: SearchMovieQueryParams): Promise<SearchMoviesResult>;
}

export interface SearchMoviesResult {
  data: TMDbMovieSearch[];
  totalCount: number;
  totalPages: number;
  page: number;
}

export interface MultiSearchResult {
  data: TMDbMediaMultiSearch[];
  totalCount: number;
  totalPages: number;
  page: number;
}

function isTvResult(result: MediaResult): result is TvResult {
  return result.media_type === 'tv';
}

export class TmdbRepository implements ITmdbRepository {
  private readonly baseUrl = 'https://api.themoviedb.org/3';

  constructor(private readonly bearer = process.env.TMDB_ACCESS_TOKEN) {}

  async multiSearch(
    params: SearchMovieQueryParams
  ): Promise<MultiSearchResult> {
    const {
      query,
      language = 'es-AR',
      page = 1,
      // region,
      // year,
    } = params;

    const json: MultiSearchApiResponse =
      await this.request<MultiSearchApiResponse>('/search/multi', {
        query,
        language,
        page: String(page),
      });

    const data: TMDbMediaMultiSearch[] = json.results.map((r: MediaResult) => {
      if (isTvResult(r)) {
        return {
          id: r.id,
          title: r.name,
          posterPath: r.poster_path ?? null,
          backdropPath: r.backdrop_path ?? null,
          year: r.first_air_date?.split('-')[0],
          overview: r.overview,
          type: r.media_type as MediaType,
        };
      }

      return {
        id: r.id,
        title: r.title,
        posterPath: r.poster_path ?? null,
        backdropPath: r.backdrop_path ?? null,
        year: r.release_date?.split('-')[0],
        overview: r.overview,
        type: r.media_type as MediaType,
        runtime: r.runtime ?? null,
      };
    });

    return {
      data,
      totalCount: json.total_results,
      totalPages: json.total_pages,
      page: json.page,
    };
  }

  async searchMovies(
    params: SearchMovieQueryParams
  ): Promise<SearchMoviesResult> {
    const {
      query,
      language = 'es-AR',
      page = 1,
      // region,
      // year,
    } = params;

    const json: SearchMovieApiResponse =
      await this.request<SearchMovieApiResponse>('/search/movie', {
        query,
        language,
        page: String(page),
      });

    const data: TMDbMovieSearch[] = json.results.map(
      (r: SearchMovieResult) => ({
        id: r.id,
        title: r.title,
        posterPath: r.poster_path ?? null,
        backdropPath: r.backdrop_path ?? null,
        year: r.release_date?.split('-')[0],
        overview: r.overview,
      })
    );

    return {
      data,
      totalCount: json.total_results,
      totalPages: json.total_pages,
      page: json.page,
    };
  }

  async searchTvs(params: SearchMovieQueryParams): Promise<SearchMoviesResult> {
    const {
      query,
      language = 'es-AR',
      page = 1,
      // region,
      // year,
    } = params;

    const json: TvShowSearchResponse = await this.request<TvShowSearchResponse>(
      '/search/tv',
      {
        query,
        language,
        page: String(page),
      }
    );

    const data: TMDbMovieSearch[] = json.results.map((r: TvShowSummary) => ({
      id: r.id,
      title: r.name,
      posterPath: r.poster_path ?? null,
      backdropPath: r.backdrop_path ?? null,
      year: r.first_air_date?.split('-')[0],
      overview: r.overview,
    }));

    return {
      data,
      totalCount: json.total_results,
      totalPages: json.total_pages,
      page: json.page,
    };
  }

  async getMovieDetail(
    movieId: number
  ): Promise<{ data: TMDbMediaMultiSearch }> {
    const json: MovieDetailApiResponse =
      await this.request<MovieDetailApiResponse>(`/movie/${movieId}`, {
        language: 'es-AR',
      });

    const data: TMDbMediaMultiSearch = {
      id: json.id,
      title: json.title,
      posterPath: json.poster_path ?? null,
      backdropPath: json.backdrop_path ?? null,
      year: json.release_date.split('-')[0],
      overview: json.overview,
      type: 'movie',
      runtime: json.runtime,
    };

    // biome-ignore lint/suspicious/noConsole: preserve TMDB response diagnostics
    console.log('GET MOVIE DETAIL', { data });

    return {
      data,
    };
  }

  async getTvDetail(serieId: number): Promise<{ data: TMDbMediaMultiSearch }> {
    const json: SerieDetailApiResponse =
      await this.request<SerieDetailApiResponse>(`/tv/${serieId}`, {
        language: 'es-AR',
      });

    const data: TMDbMediaMultiSearch = {
      id: json.id,
      title: json.name,
      posterPath: json.poster_path ?? null,
      backdropPath: json.backdrop_path ?? null,
      year: json.first_air_date.split('-')[0],
      overview: json.overview,
      type: 'tv',
    };

    return {
      data,
    };
  }

  async getMovieWatchProviders(
    movieId: number
  ): Promise<{ data: WatchProviderResult }> {
    const json: WatchProviderApiResponse =
      await this.request<WatchProviderApiResponse>(
        `/movie/${movieId}/watch/providers`
      );

    return {
      data: json.results.AR,
    };
  }

  async getTvWatchProviders(
    tvId: number
  ): Promise<{ data: WatchProviderResult }> {
    const json: WatchProviderApiResponse =
      await this.request<WatchProviderApiResponse>(
        `/tv/${tvId}/watch/providers`
      );

    return {
      data: json.results.AR,
    };
  }

  async clearCache(endpoint?: string): Promise<void> {
    const pattern = endpoint ? `tmdb_cache:${endpoint}:*` : 'tmdb_cache:*';
    await cache.deleteByPattern(pattern);
  }

  private async request<T>(
    endpoint: string,
    qs?: Record<string, string>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}?${new URLSearchParams(qs)}`;
    const cacheKey = `tmdb_cache:${endpoint}:${new URLSearchParams(qs).toString()}`;

    // Check cache first
    const cached = await cache.get<T>(cacheKey);
    if (cached) {
      return cached;
    }

    const isLocked = await cache.get('tmdb_rate_limit_lock');
    if (isLocked) {
      throw new Error(
        'TMDB API is currently rate-limited. Please try again later.'
      );
    }

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.bearer}`,
        'Content-Type': 'application/json;charset=utf-8',
      },
    });

    if (res.status === 429) {
      const retryAfterHeader = res.headers.get('Retry-After');
      const waitSeconds = retryAfterHeader
        ? Number.parseInt(retryAfterHeader, 10)
        : 50;

      // biome-ignore lint:reason
      console.warn(
        `RATE LIMIT HIT. Setting external lock for ${waitSeconds} seconds.`
      );

      await cache.set('tmdb_rate_limit_lock', 'true', waitSeconds);

      throw new Error('Rate limit exceeded.');
    }

    if (!res.ok) {
      throw new Error(`TMDB error (${res.status})`);
    }

    const data = await res.json();

    // Cache the response with different TTL based on endpoint type
    let cacheTTL = 300; // Default 5 minutes

    if (endpoint.includes('/search/')) {
      cacheTTL = 1800; // 30 minutes for search results
    } else if (endpoint.includes('/movie/') || endpoint.includes('/tv/')) {
      if (endpoint.includes('/watch/providers')) {
        cacheTTL = 86_400; // 24 hours for watch providers
      } else {
        cacheTTL = 3600; // 1 hour for movie/tv details
      }
    }

    // Store in cache
    try {
      await cache.set(cacheKey, data, cacheTTL);
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: cache failures are intentionally non-fatal
      console.warn('Failed to cache data:', error);
      // Continue without caching
    }

    return data as T;
  }
}
