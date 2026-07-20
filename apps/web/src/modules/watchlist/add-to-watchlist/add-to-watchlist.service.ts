import { AddToWatchlistPgRepository } from './add-to-watchlist.pg.repository';

export class AddToWatchlistService {
  constructor(
    private readonly repository: AddToWatchlistPgRepository = new AddToWatchlistPgRepository()
  ) {}

  async add(userId: string, mediaId: string): Promise<void> {
    await this.repository.add(userId, mediaId);
  }
}
