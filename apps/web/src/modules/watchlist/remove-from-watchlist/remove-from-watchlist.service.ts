import { RemoveFromWatchlistPgRepository } from './remove-from-watchlist.pg.repository';

export class RemoveFromWatchlistService {
  constructor(
    private readonly repository: RemoveFromWatchlistPgRepository = new RemoveFromWatchlistPgRepository()
  ) {}

  async remove(userId: string, mediaId: string): Promise<void> {
    await this.repository.remove(userId, mediaId);
  }
}
