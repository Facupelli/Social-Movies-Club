import type { Media } from "@/platform/database/postgres/schema";
import type { MediaType } from "@/modules/media-catalog/media.type";
import { MediaPgRepository } from "./media.pg.repository";

export class MediaService {
	constructor(
		private readonly repo: MediaPgRepository = new MediaPgRepository(),
	) {}

	async upsertMedia(movie: Omit<Media, "id">): Promise<{ id: string }> {
		return await this.repo.upsertMedia(movie);
	}

	async getMediaByTmdbIdentity(
		tmdbId: number,
		type: MediaType,
	): Promise<{ id: string } | undefined> {
		return await this.repo.getMediaByTmdbIdentity(tmdbId, type);
	}

	async getMediaById(mediaId: bigint): Promise<Media[]> {
		return await this.repo.getMediaById(mediaId);
	}
}
