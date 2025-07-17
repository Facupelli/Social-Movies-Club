import type { Media } from '@/infra/postgres/schema';
import { MediaPgRepository } from './movie.pg.repository';

export class MediaService {
  constructor(
    private readonly repo: MediaPgRepository = new MediaPgRepository()
  ) {}

  async upsertMedia(movie: Omit<Media, 'id'>): Promise<{ id: bigint }> {
    return await this.repo.upsertMedia(movie);
  }

  async getMediaByTMDBId(tmdbId: number): Promise<{ id: string }> {
    return await this.repo.getMediaByTMDBId(tmdbId);
  }

  async getMediaById(mediaId: bigint): Promise<Media[]> {
    return await this.repo.getMediaById(mediaId);
  }
}
