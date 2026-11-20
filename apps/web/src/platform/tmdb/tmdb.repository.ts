import type { z } from 'zod';
import type {
  TMDbMediaMultiSearch,
  TMDbMovieSearch,
} from '@/modules/media-catalog/media.type';
import { getCache } from '@/platform/cache/cache';
import type {
  TmdbProviderCatalogueEntry,
  TmdbWatchProviderResponse,
} from '@/platform/tmdb/tmdb.schemas';
import {
  movieDetailResponseSchema,
  movieSearchResponseSchema,
  multiSearchResponseSchema,
  nowPlayingMovieIdsSchema,
  nowPlayingPageSchema,
  providerCatalogueResponseSchema,
  tvDetailResponseSchema,
  tvSearchResponseSchema,
  watchProviderResponseSchema,
} from '@/platform/tmdb/tmdb.schemas';
import {
  buildTmdbCacheKey,
  normalizeTmdbSearchQuery,
  TMDB_CACHE_TTL_SECONDS,
} from '@/platform/tmdb/tmdb-cache-policy';
import {
  parseRetryAfterSeconds,
  TmdbHttpError,
} from '@/platform/tmdb/tmdb-http-error';
import {
  fromTmdbMediaType,
  type TmdbMediaType,
} from '@/platform/tmdb/tmdb-media-kind';
import type { SearchMovieQueryParams } from '@/platform/tmdb/types/search-movie';
import type {
  TmdbAvailabilityOffer,
  TmdbMediaAvailability,
  TmdbProvider,
  TmdbProviderCatalogue,
} from '@/platform/tmdb/types/streaming';

const DEFAULT_LANGUAGE = 'es-AR';
const DEFAULT_PAGE = 1;
const INCLUDE_ADULT = false;
const NOW_PLAYING_MAX_PAGES = 50;
const NOW_PLAYING_CONCURRENCY = 4;
const NOW_PLAYING_TIMEOUT_MS = 5000;
const NOW_PLAYING_CACHE_TIMEOUT_MS = 150;

async function withNowPlayingCacheDeadline<T>(
  operation: Promise<T>
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error('Now-playing cache timed out')),
          NOW_PLAYING_CACHE_TIMEOUT_MS
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

function nowPlayingCacheKey(countryCode: string): string {
  return buildTmdbCacheKey('now-playing', {
    countryCode,
    language: DEFAULT_LANGUAGE,
  });
}

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
            kind: fromTmdbMediaType('tv'),
          }
        : {
            id: result.id,
            title: result.title,
            posterPath: result.poster_path ?? '',
            backdropPath: result.backdrop_path ?? '',
            year: result.release_date.split('-')[0],
            overview: result.overview,
            kind: fromTmdbMediaType('movie'),
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
        originalTitle: json.original_title,
        releaseDate: json.release_date || undefined,
        posterPath: json.poster_path ?? '',
        backdropPath: json.backdrop_path ?? '',
        year: json.release_date.split('-')[0],
        overview: json.overview,
        kind: fromTmdbMediaType('movie'),
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
        originalTitle: json.original_name,
        releaseDate: json.first_air_date || undefined,
        posterPath: json.poster_path ?? '',
        backdropPath: json.backdrop_path ?? '',
        year: json.first_air_date.split('-')[0],
        overview: json.overview,
        kind: fromTmdbMediaType('tv'),
      },
    };
  }

  async getWatchProvidersForRegion(
    countryCode: string,
    mediaType: TmdbMediaType
  ): Promise<TmdbProviderCatalogue> {
    const json = await this.request({
      endpoint: `/watch/providers/${mediaType}`,
      query: { watch_region: countryCode },
      cacheKey: buildTmdbCacheKey('provider-catalogue', {
        countryCode,
        mediaType,
      }),
      ttlSeconds: TMDB_CACHE_TTL_SECONDS.providerCatalogue,
      schema: providerCatalogueResponseSchema,
    });

    return {
      countryCode,
      kind: fromTmdbMediaType(mediaType),
      providers: json.results.map(normalizeProviderCatalogueEntry),
    };
  }

  async getMediaWatchProviders(
    mediaId: number,
    mediaType: TmdbMediaType
  ): Promise<TmdbMediaAvailability> {
    const json = await this.fetchWatchProviders(mediaId, mediaType);
    return normalizeMediaAvailability(json);
  }

  async readNowPlayingMovieIds(countryCode: string): Promise<number[] | null> {
    const cached = await withNowPlayingCacheDeadline(
      getCache().get<unknown>(nowPlayingCacheKey(countryCode))
    );
    const parsed = nowPlayingMovieIdsSchema.safeParse(cached);
    return parsed.success ? parsed.data : null;
  }

  async refreshNowPlayingMovieIds(countryCode: string): Promise<number[]> {
    const controller = new AbortController();
    const signal = AbortSignal.any([
      controller.signal,
      AbortSignal.timeout(NOW_PLAYING_TIMEOUT_MS),
    ]);
    const loadPage = async (page: number) => {
      const response = await this.fetchJson(
        '/movie/now_playing',
        { language: DEFAULT_LANGUAGE, page: String(page), region: countryCode },
        signal
      );
      const data = nowPlayingPageSchema.parse(response);
      if (data.page !== page) {
        throw new Error('Unexpected TMDB now-playing page');
      }
      return data;
    };

    const movieIds = new Set<number>();
    try {
      const first = await loadPage(1);
      const totalPages = first.total_pages;
      if (
        totalPages > NOW_PLAYING_MAX_PAGES ||
        (totalPages === 0 && first.results.length > 0) ||
        (totalPages > 1 && first.results.length === 0)
      ) {
        throw new Error('Invalid TMDB now-playing page count');
      }
      for (const { id } of first.results) {
        movieIds.add(id);
      }

      let nextPage = 2;
      const loadRemainingPages = async (): Promise<void> => {
        if (nextPage > totalPages) {
          return;
        }
        const page = await loadPage(nextPage++);
        if (page.total_pages !== totalPages || page.results.length === 0) {
          throw new Error('TMDB now-playing pagination changed during refresh');
        }
        for (const { id } of page.results) {
          movieIds.add(id);
        }
        await loadRemainingPages();
      };

      await Promise.all(
        Array.from(
          {
            length: Math.min(
              NOW_PLAYING_CONCURRENCY,
              Math.max(0, totalPages - 1)
            ),
          },
          loadRemainingPages
        )
      );
    } finally {
      controller.abort();
    }

    const snapshot = [...movieIds];
    await withNowPlayingCacheDeadline(
      getCache().set(
        nowPlayingCacheKey(countryCode),
        snapshot,
        TMDB_CACHE_TTL_SECONDS.nowPlaying
      )
    );
    return snapshot;
  }

  private async searchByType(
    type: TmdbMediaType,
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

  private async fetchWatchProviders(
    mediaId: number,
    mediaType: TmdbMediaType
  ): Promise<TmdbWatchProviderResponse> {
    return await this.request({
      endpoint: `/${mediaType}/${mediaId}/watch/providers`,
      cacheKey: buildTmdbCacheKey('watch-providers', { mediaId, mediaType }),
      ttlSeconds: TMDB_CACHE_TTL_SECONDS.watchProviders,
      schema: watchProviderResponseSchema,
    });
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

    const data = schema.parse(await this.fetchJson(endpoint, query));

    try {
      await sharedCache.set(cacheKey, data, ttlSeconds);
    } catch {
      // Cache writes are best-effort and never replace a valid upstream result.
    }

    return data;
  }

  private async fetchJson(
    endpoint: string,
    query?: Record<string, string>,
    signal?: AbortSignal
  ): Promise<unknown> {
    if (!this.bearer) {
      throw new Error('TMDB_ACCESS_TOKEN is required');
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    for (const [key, value] of Object.entries(query ?? {})) {
      url.searchParams.set(key, value);
    }

    const response = await fetch(url, {
      signal,
      headers: {
        Authorization: `Bearer ${this.bearer}`,
        'Content-Type': 'application/json;charset=utf-8',
      },
    });

    if (!response.ok) {
      const retryAfterSeconds =
        response.status === 429
          ? parseRetryAfterSeconds(response.headers.get('retry-after'))
          : undefined;

      throw new TmdbHttpError(
        `TMDB error (${response.status})`,
        response.status,
        retryAfterSeconds
      );
    }

    return await response.json();
  }
}

function normalizeProviderCatalogueEntry(
  entry: TmdbProviderCatalogueEntry
): TmdbProvider {
  return {
    tmdbProviderId: entry.provider_id,
    name: entry.provider_name,
    logoPath: entry.logo_path,
    displayPriority: entry.display_priority,
  };
}

const OFFER_CATEGORIES = ['flatrate', 'free', 'ads', 'rent', 'buy'] as const;

function normalizeMediaAvailability(
  json: TmdbWatchProviderResponse
): TmdbMediaAvailability {
  const countries = Object.entries(json.results).map(
    ([countryCode, region]) => {
      const offers: TmdbAvailabilityOffer[] = [];

      for (const category of OFFER_CATEGORIES) {
        const categoryOffers = region[category];
        if (!categoryOffers) {
          continue;
        }

        for (const offer of categoryOffers) {
          offers.push({
            tmdbProviderId: offer.provider_id,
            name: offer.provider_name,
            logoPath: offer.logo_path,
            displayPriority: offer.display_priority,
            monetizationType: category,
          });
        }
      }

      return { countryCode, link: region.link, offers };
    }
  );

  return { countries };
}
