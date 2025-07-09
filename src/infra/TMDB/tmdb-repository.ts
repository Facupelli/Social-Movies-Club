import type {
  SearchMovieApiResponse,
  SearchMovieQueryParams,
  SearchMovieResult,
} from '@/infra/TMDB/types/search-movie';
import type { MovieViewModel } from '@/movies/movie.type';
import type { MovieDetailApiResponse } from './types/detail-movie';

interface ITmdbRepository {
  searchMovies(params: SearchMovieQueryParams): Promise<SearchMoviesResult>;
}

interface MovieSummary {
  id: number;
  title: string;
  posterPath: string | null;
  releaseDate: string;
  voteAverage: number;
}

export interface SearchMoviesResult {
  data: MovieSummary[];
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

    // Down-map the payload to your domain model
    const data: MovieSummary[] = json.results.map((r: SearchMovieResult) => ({
      id: r.id,
      title: r.title,
      posterPath: r.poster_path ?? null,
      releaseDate: r.release_date,
      voteAverage: r.vote_average,
    }));

    return {
      data,
      totalCount: json.total_results,
      totalPages: json.total_pages,
      page: json.page,
    };
  }

  async getDetail(movieId: number): Promise<{ data: MovieViewModel }> {
    const json: MovieDetailApiResponse =
      await this.request<MovieDetailApiResponse>(`/movie/${movieId}`);

    const data: MovieViewModel = {
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
