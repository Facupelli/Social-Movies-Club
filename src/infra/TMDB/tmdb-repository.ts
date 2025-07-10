import type {
  SearchMovieApiResponse,
  SearchMovieQueryParams,
  SearchMovieResult,
} from '@/infra/TMDB/types/search-movie';
import type { MovieData, MovieViewModel } from '@/movies/movie.type';
import type { MovieDetailApiResponse } from './types/detail-movie';
import type {
  WatchProviderApiResponse,
  WatchProviderResult,
} from './types/watch-provider';

interface ITmdbRepository {
  searchMovies(params: SearchMovieQueryParams): Promise<SearchMoviesResult>;
}

export interface SearchMoviesResult {
  data: MovieViewModel[];
  totalCount: number;
  totalPages: number;
  page: number;
}

export class TmdbRepository implements ITmdbRepository {
  private readonly baseUrl = 'https://api.themoviedb.org/3';
  constructor(private readonly bearer = process.env.TMDB_ACCESS_TOKEN) {}

  async searchMovies(
    params: SearchMovieQueryParams
  ): Promise<SearchMoviesResult> {
    const {
      query,
      language = 'en-US',
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

    const data: MovieViewModel[] = json.results.map((r: SearchMovieResult) => ({
      id: r.id,
      title: r.title,
      posterPath: r.poster_path ?? null,
      releaseDate: r.release_date,
      genres: null,
      addedAt: new Date(),
      originalTitle: r.original_title,
      rating: null,
    }));

    return {
      data,
      totalCount: json.total_results,
      totalPages: json.total_pages,
      page: json.page,
    };
  }

  async getDetail(movieId: number): Promise<{ data: MovieData }> {
    const json: MovieDetailApiResponse =
      await this.request<MovieDetailApiResponse>(`/movie/${movieId}`);

    const data: MovieData = {
      id: json.id,
      title: json.title,
      posterPath: json.poster_path ?? null,
      releaseDate: json.release_date,
      addedAt: new Date(),
      originalTitle: json.original_title,
      genres: json.genres,
    };

    return {
      data,
    };
  }

  async getWatchProviders(
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

  private async request<T>(
    endpoint: string,
    qs?: Record<string, string>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}?${new URLSearchParams(qs)}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.bearer}`,
        'Content-Type': 'application/json;charset=utf-8',
      },
    });

    if (!res.ok) {
      throw new Error(`TMDB error (${res.status})`);
    }

    return (await res.json()) as T;
  }
}
