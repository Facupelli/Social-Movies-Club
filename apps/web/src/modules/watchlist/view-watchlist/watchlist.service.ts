import type { MovieView } from "@/modules/media-catalog/movie-view";
import { dbWatchlistMovieToView } from "@/modules/media-catalog/get-media-details/media.adapters";
import { WatchlistPgRepository } from "./watchlist.repository";

export class WatchlistService {
	constructor(
		private readonly repo: WatchlistPgRepository = new WatchlistPgRepository(),
	) {}

	async hasMedia(userId: string, mediaId: string) {
		return await this.repo.getExists(userId, mediaId);
	}

	async addMedia(userId: string, mediaId: string) {
		return await this.repo.addMedia(userId, mediaId);
	}

	async removeMedia(userId: string, mediaId: string) {
		return await this.repo.removeMedia(userId, mediaId);
	}

	async getWatchlist(userId: string): Promise<MovieView[]> {
		const watchlist = await this.repo.getWatchlist(userId);

		const watchlistMovieView = watchlist.map(dbWatchlistMovieToView);
		return watchlistMovieView;
	}
}
