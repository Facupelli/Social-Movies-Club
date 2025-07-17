import {
	type MultiSearchResult,
	type SearchMoviesResult,
	TmdbRepository,
} from "@/infra/TMDB/tmdb.repository";
import type { WatchProviderResult } from "@/infra/TMDB/types/watch-provider";
import type { MediaType, TMDbMediaMultiSearch } from "@/media/media.type";

export class TmdbService {
	constructor(
		private readonly repo: TmdbRepository = new TmdbRepository(
			process.env.TMDB_ACCESS_TOKEN as string,
		),
	) {}

	async multiSearch(query: string): Promise<MultiSearchResult> {
		return await this.repo.multiSearch({
			query,
		});
	}

	async searchMovie(query: string): Promise<SearchMoviesResult> {
		return await this.repo.searchMovies({
			query,
		});
	}

	async getMovieDetail(
		movieId: number,
	): Promise<{ data: TMDbMediaMultiSearch }> {
		return await this.repo.getMovieDetail(movieId);
	}

	async getTvDetail(movieId: number): Promise<{ data: TMDbMediaMultiSearch }> {
		return await this.repo.getTvDetail(movieId);
	}

	async getWatchProvider(
		mediaId: number,
		type: MediaType,
	): Promise<{ data: WatchProviderResult }> {
		if (type === "movie") {
			return await this.repo.getMovieWatchProviders(mediaId);
		}

		return await this.repo.getTvWatchProviders(mediaId);
	}
}
