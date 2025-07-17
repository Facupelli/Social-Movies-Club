import { kv } from "@vercel/kv";
import type {
	SearchMovieApiResponse,
	SearchMovieQueryParams,
	SearchMovieResult,
} from "@/infra/TMDB/types/search-movie";
import type {
	MediaType,
	TMDbMediaMultiSearch,
	TMDbMovieSearch,
} from "@/media/media.type";
import type { MovieDetailApiResponse } from "./types/detail-movie";
import type { SerieDetailApiResponse } from "./types/detail-serie";
import type {
	MediaResult,
	MultiSearchApiResponse,
	TvResult,
} from "./types/multi-search";
import type { TvShowSearchResponse, TvShowSummary } from "./types/search-tv";
import type {
	WatchProviderApiResponse,
	WatchProviderResult,
} from "./types/watch-provider";

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
	return result.media_type === "tv";
}

export class TmdbRepository implements ITmdbRepository {
	private readonly baseUrl = "https://api.themoviedb.org/3";

	constructor(private readonly bearer = process.env.TMDB_ACCESS_TOKEN) {}

	async multiSearch(
		params: SearchMovieQueryParams,
	): Promise<MultiSearchResult> {
		const {
			query,
			language = "es-AR",
			page = 1,
			// region,
			// year,
		} = params;

		const json: MultiSearchApiResponse =
			await this.request<MultiSearchApiResponse>("/search/multi", {
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
					year: r.first_air_date?.split("-")[0],
					overview: r.overview,
					type: r.media_type as MediaType,
				};
			}

			return {
				id: r.id,
				title: r.title,
				posterPath: r.poster_path ?? null,
				year: r.release_date?.split("-")[0],
				overview: r.overview,
				type: r.media_type as MediaType,
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
		params: SearchMovieQueryParams,
	): Promise<SearchMoviesResult> {
		const {
			query,
			language = "es-AR",
			page = 1,
			// region,
			// year,
		} = params;

		const json: SearchMovieApiResponse =
			await this.request<SearchMovieApiResponse>("/search/movie", {
				query,
				language,
				page: String(page),
			});

		const data: TMDbMovieSearch[] = json.results.map(
			(r: SearchMovieResult) => ({
				id: r.id,
				title: r.title,
				posterPath: r.poster_path ?? null,
				year: r.release_date?.split("-")[0],
				overview: r.overview,
			}),
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
			language = "es-AR",
			page = 1,
			// region,
			// year,
		} = params;

		const json: TvShowSearchResponse = await this.request<TvShowSearchResponse>(
			"/search/tv",
			{
				query,
				language,
				page: String(page),
			},
		);

		const data: TMDbMovieSearch[] = json.results.map((r: TvShowSummary) => ({
			id: r.id,
			title: r.name,
			posterPath: r.poster_path ?? null,
			year: r.first_air_date?.split("-")[0],
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
		movieId: number,
	): Promise<{ data: TMDbMediaMultiSearch }> {
		const json: MovieDetailApiResponse =
			await this.request<MovieDetailApiResponse>(`/movie/${movieId}`, {
				language: "es-AR",
			});

		const data: TMDbMediaMultiSearch = {
			id: json.id,
			title: json.title,
			posterPath: json.poster_path ?? null,
			year: json.release_date.split("-")[0],
			overview: json.overview,
			type: "movie",
		};

		return {
			data,
		};
	}

	async getTvDetail(serieId: number): Promise<{ data: TMDbMediaMultiSearch }> {
		const json: SerieDetailApiResponse =
			await this.request<SerieDetailApiResponse>(`/tv/${serieId}`, {
				language: "es-AR",
			});

		const data: TMDbMediaMultiSearch = {
			id: json.id,
			title: json.name,
			posterPath: json.poster_path ?? null,
			year: json.first_air_date.split("-")[0],
			overview: json.overview,
			type: "tv",
		};

		return {
			data,
		};
	}

	async getMovieWatchProviders(
		movieId: number,
	): Promise<{ data: WatchProviderResult }> {
		const json: WatchProviderApiResponse =
			await this.request<WatchProviderApiResponse>(
				`/movie/${movieId}/watch/providers`,
			);

		return {
			data: json.results.AR,
		};
	}

	async getTvWatchProviders(
		tvId: number,
	): Promise<{ data: WatchProviderResult }> {
		const json: WatchProviderApiResponse =
			await this.request<WatchProviderApiResponse>(
				`/tv/${tvId}/watch/providers`,
			);

		return {
			data: json.results.AR,
		};
	}

	private async request<T>(
		endpoint: string,
		qs?: Record<string, string>,
	): Promise<T> {
		const url = `${this.baseUrl}${endpoint}?${new URLSearchParams(qs)}`;

		const isLocked = await kv.get("tmdb_rate_limit_lock");
		if (isLocked) {
			throw new Error(
				"TMDB API is currently rate-limited. Please try again later.",
			);
		}

		const res = await fetch(url, {
			headers: {
				Authorization: `Bearer ${this.bearer}`,
				"Content-Type": "application/json;charset=utf-8",
			},
		});

		if (res.status === 429) {
			const retryAfterHeader = res.headers.get("Retry-After");
			const waitSeconds = retryAfterHeader
				? Number.parseInt(retryAfterHeader, 10)
				: 50;

			// biome-ignore lint:reason
			console.warn(
				`RATE LIMIT HIT. Setting external lock for ${waitSeconds} seconds.`,
			);

			await kv.set("tmdb_rate_limit_lock", "true", { ex: waitSeconds });

			throw new Error("Rate limit exceeded.");
		}

		if (!res.ok) {
			throw new Error(`TMDB error (${res.status})`);
		}

		return (await res.json()) as T;
	}
}
