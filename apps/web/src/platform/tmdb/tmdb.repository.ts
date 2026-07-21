import type { z } from 'zod';
import type { WatchProviderResponse } from '@/modules/media-catalog/get-watch-providers/watch-provider.types';
import type {
  MediaType,
  TMDbMediaMultiSearch,
  TMDbMovieSearch,
} from '@/modules/media-catalog/media.type';
import { getCache } from '@/platform/cache/cache';
import {
  buildTmdbCacheKey,
  normalizeTmdbSearchQuery,
  TMDB_CACHE_TTL_SECONDS,
} from '@/platform/tmdb/tmdb-cache-policy';
import {
  movieDetailResponseSchema,
  movieSearchResponseSchema,
  multiSearchResponseSchema,
  tvDetailResponseSchema,
  tvSearchResponseSchema,
  watchProviderResponseSchema,
} from '@/platform/tmdb/tmdb.schemas';
import type { SearchMovieQueryParams } from '@/platform/tmdb/types/search-movie';

const DEFAULT_LANGUAGE = 'es-AR';
const DEFAULT_REGION = 'AR';
const DEFAULT_PAGE = 1;
const INCLUDE_ADULT = false;

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

export class TmdbRepository implements ITmdbRepository {
  private readonly baseUrl = 'https://api.themoviedb.org/3';

  constructor(private readonly bearer = process.env.TMDB_ACCESS_TOKEN) {}

  async multiSearch(
    params: SearchMovieQueryParams
  ): Promise<MultiSearchResult> {
    const query = normalizeTmdbSearchQuery(params.query);
    const language = params.language ?? DEFAULT_LANGUAGE;
    const page = params.page ?? DEFAULT_PAGE;
    const json = await this.request({
      endpoint: '/search/multi',
      query: {
        include_adult: String(INCLUDE_ADULT),
        language,
        page: String(page),
        query,
      },
      cacheKey: buildTmdbCacheKey('search', {
        includeAdult: INCLUDE_ADULT,
        language,
        page,
        query,
        searchType: 'multi',
      }),
      ttlSeconds: TMDB_CACHE_TTL_SECONDS.search,
      schema: multiSearchResponseSchema,
    });

    const data: TMDbMediaMultiSearch[] = json.results.map((result) =>
      result.media_type === 'tv'
        ? {
            id: result.id,
            title: result.name,
            posterPath: result.poster_path ?? '',
            backdropPath: result.backdrop_path ?? '',
            year: result.first_air_date.split('-')[0],
            overview: result.overview,
            type: 'tv',
          }
        : {
            id: result.id,
            title: result.title,
            posterPath: result.poster_path ?? '',
            backdropPath: result.backdrop_path ?? '',
            year: result.release_date.split('-')[0],
            overview: result.overview,
            type: 'movie',
            runtime: result.runtime ?? undefined,
          }
    );

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
    return await this.searchByType('movie', params);
  }

  async searchTvs(params: SearchMovieQueryParams): Promise<SearchMoviesResult> {
    return await this.searchByType('tv', params);
  }

  async getMovieDetail(
    movieId: number
  ): Promise<{ data: TMDbMediaMultiSearch }> {
    const json = await this.request({
      endpoint: `/movie/${movieId}`,
      query: { language: DEFAULT_LANGUAGE },
      cacheKey: buildTmdbCacheKey('media-details', {
        language: DEFAULT_LANGUAGE,
        mediaId: movieId,
        mediaType: 'movie',
      }),
      ttlSeconds: TMDB_CACHE_TTL_SECONDS.mediaDetails,
      schema: movieDetailResponseSchema,
    });

    return {
      data: {
        id: json.id,
        title: json.title,
        posterPath: json.poster_path ?? '',
        backdropPath: json.backdrop_path ?? '',
        year: json.release_date.split('-')[0],
        overview: json.overview,
        type: 'movie',
        runtime: json.runtime ?? undefined,
      },
    };
  }

  async getTvDetail(serieId: number): Promise<{ data: TMDbMediaMultiSearch }> {
    const json = await this.request({
      endpoint: `/tv/${serieId}`,
      query: { language: DEFAULT_LANGUAGE },
      cacheKey: buildTmdbCacheKey('media-details', {
        language: DEFAULT_LANGUAGE,
        mediaId: serieId,
        mediaType: 'tv',
      }),
      ttlSeconds: TMDB_CACHE_TTL_SECONDS.mediaDetails,
      schema: tvDetailResponseSchema,
    });

    return {
      data: {
        id: json.id,
        title: json.name,
        posterPath: json.poster_path ?? '',
        backdropPath: json.backdrop_path ?? '',
        year: json.first_air_date.split('-')[0],
        overview: json.overview,
        type: 'tv',
      },
    };
  }

  async getMovieWatchProviders(
    movieId: number
  ): Promise<WatchProviderResponse> {
    return await this.getWatchProviders(movieId, 'movie');
  }

  async getTvWatchProviders(tvId: number): Promise<WatchProviderResponse> {
    return await this.getWatchProviders(tvId, 'tv');
  }

  private async searchByType(
    type: MediaType,
    params: SearchMovieQueryParams
  ): Promise<SearchMoviesResult> {
    const query = normalizeTmdbSearchQuery(params.query);
    const language = params.language ?? DEFAULT_LANGUAGE;
    const page = params.page ?? DEFAULT_PAGE;
    const requestOptions = {
      endpoint: `/search/${type}`,
      query: {
        include_adult: String(INCLUDE_ADULT),
        language,
        page: String(page),
        query,
      },
      cacheKey: buildTmdbCacheKey('search', {
        includeAdult: INCLUDE_ADULT,
        language,
        page,
        query,
        searchType: type,
      }),
      ttlSeconds: TMDB_CACHE_TTL_SECONDS.search,
    };

    if (type === 'movie') {
      const json = await this.request({
        ...requestOptions,
        schema: movieSearchResponseSchema,
      });
      return {
        data: json.results.map((result) => ({
          id: result.id,
          title: result.title,
          posterPath: result.poster_path ?? '',
          backdropPath: result.backdrop_path ?? '',
          year: result.release_date.split('-')[0],
          overview: result.overview,
        })),
        totalCount: json.total_results,
        totalPages: json.total_pages,
        page: json.page,
      };
    }

    const json = await this.request({
      ...requestOptions,
      schema: tvSearchResponseSchema,
    });
    return {
      data: json.results.map((result) => ({
        id: result.id,
        title: result.name,
        posterPath: result.poster_path ?? '',
        backdropPath: result.backdrop_path ?? '',
        year: result.first_air_date.split('-')[0],
        overview: result.overview,
      })),
      totalCount: json.total_results,
      totalPages: json.total_pages,
      page: json.page,
    };
  }

  private async getWatchProviders(
    mediaId: number,
    mediaType: MediaType
  ): Promise<WatchProviderResponse> {
    const json = await this.request({
      endpoint: `/${mediaType}/${mediaId}/watch/providers`,
      cacheKey: buildTmdbCacheKey('watch-providers', {
        mediaId,
        mediaType,
        region: DEFAULT_REGION,
      }),
      ttlSeconds: TMDB_CACHE_TTL_SECONDS.watchProviders,
      schema: watchProviderResponseSchema,
    });
    return { data: json.results[DEFAULT_REGION] ?? null };
  }

  private async request<TSchema extends z.ZodType>({
    endpoint,
    query,
    cacheKey,
    ttlSeconds,
    schema,
  }: {
    endpoint: string;
    query?: Record<string, string>;
    cacheKey: string;
    ttlSeconds: number;
    schema: TSchema;
  }): Promise<z.output<TSchema>> {
    if (!this.bearer) {
      throw new Error('TMDB_ACCESS_TOKEN is required');
    }

    const sharedCache = getCache();
    try {
      const cached = await sharedCache.get<unknown>(cacheKey);
      if (cached !== null) {
        const parsedCached = schema.safeParse(cached);
        if (parsedCached.success) {
          return parsedCached.data;
        }
      }
    } catch {
      // Cache outages must not make the upstream resource unavailable.
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    for (const [key, value] of Object.entries(query ?? {})) {
      url.searchParams.set(key, value);
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.bearer}`,
        'Content-Type': 'application/json;charset=utf-8',
      },
    });

    if (!response.ok) {
      throw new Error(`TMDB error (${response.status})`);
    }

    const data = schema.parse(await response.json());

    try {
      await sharedCache.set(cacheKey, data, ttlSeconds);
    } catch {
      // Cache writes are best-effort and never replace a valid upstream result.
    }

    return data;
  }
}
