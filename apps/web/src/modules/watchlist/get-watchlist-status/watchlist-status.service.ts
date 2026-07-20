import { WatchlistStatusPgRepository } from './watchlist-status.pg.repository';
import type { WatchlistMediaIdentity } from './watchlist-status.types';

export class WatchlistStatusService {
  constructor(
    private readonly repository: WatchlistStatusPgRepository = new WatchlistStatusPgRepository()
  ) {}

  async hasMedia(userId: string, mediaId: string): Promise<boolean> {
    return await this.repository.hasMedia(userId, mediaId);
  }

  async listMediaIdentities(
    userId: string
  ): Promise<WatchlistMediaIdentity[]> {
    return await this.repository.listMediaIdentities(userId);
  }
}
