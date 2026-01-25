import { revalidateTag } from "next/cache";
import type { Media } from "@/infra/postgres/schema";
import { TmdbService } from "@/infra/TMDB/tmdb.service";
import { NEXT_CACHE_TAGS } from "@/lib/app.constants";
import { MediaService } from "@/media/media.service";
import type { MediaType, TMDbMediaMultiSearch } from "@/media/media.type";
import { WatchlistService } from "@/watchlist/watchlist.service";
import { UserService } from "./user.service";

export class UserMediaService {
	constructor(
		private readonly watchlistService = new WatchlistService(),
		private readonly mediaService = new MediaService(),
		private readonly userService = new UserService(),
		private readonly tmdbService = new TmdbService(),
	) {}

	async rateMovie({
		userId,
		tmdbId,
		rating,
		type,
	}: {
		userId: string;
		tmdbId: number;
		rating: number;
		type: MediaType;
	}): Promise<void> {
		const media = await this.getMediaDetail(tmdbId, type);

		console.log({ media });

		const movieData: Omit<Media, "id"> = {
			posterPath: media.posterPath,
			backdropPath: media.backdropPath,
			title: media.title,
			year: media.year,
			tmdbId: media.id,
			overview: media.overview,
			type,
			runtime: media.runtime ?? null,
		};

		const { id: mediaId } = await this.mediaService.upsertMedia(movieData);

		await this.userService.rateMovie(userId, mediaId, rating);

		const isInWatchList = await this.watchlistService.hasMedia(userId, mediaId);
		if (isInWatchList) {
			await this.watchlistService.removeMedia(userId, mediaId);
			revalidateTag(NEXT_CACHE_TAGS.getUserWatchlist(userId));
		}
	}

	async addMediaToWatchlist(userId: string, tmdbId: number, type: MediaType) {
		const media = await this.getMediaDetail(tmdbId, type);

		const movieData: Omit<Media, "id"> = {
			posterPath: media.posterPath,
			backdropPath: media.backdropPath,
			title: media.title,
			year: media.year,
			tmdbId: media.id,
			overview: media.overview,
			type,
			runtime: media.runtime ?? null,
		};

		const { id: movieId } = await this.mediaService.upsertMedia(movieData);

		return this.watchlistService.addMedia(userId, movieId);
	}

	private async getMediaDetail(
		tmdbId: number,
		type: MediaType,
	): Promise<TMDbMediaMultiSearch> {
		let data: { data: TMDbMediaMultiSearch } | undefined;

		if (type === "movie") {
			data = await this.tmdbService.getMovieDetail(tmdbId);
		} else if (type === "tv") {
			data = await this.tmdbService.getTvDetail(tmdbId);
		}

		if (!data?.data) {
			throw new Error("Invalid media type");
		}

		return data.data;
	}
}
