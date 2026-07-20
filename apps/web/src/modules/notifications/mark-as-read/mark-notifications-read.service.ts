import { MarkNotificationsReadPgRepository } from './mark-notifications-read.pg.repository';

export class MarkNotificationsReadService {
  constructor(
    private readonly repository = new MarkNotificationsReadPgRepository()
  ) {}

  async markAll(userId: string): Promise<number> {
    return await this.repository.markAll(userId);
  }
}
