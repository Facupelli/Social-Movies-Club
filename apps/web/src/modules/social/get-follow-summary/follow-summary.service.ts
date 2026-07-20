import { FollowSummaryPgRepository } from './follow-summary.pg.repository';
import type { FollowSummary } from './follow-summary.types';

export class FollowSummaryService {
  constructor(
    private readonly repository: FollowSummaryPgRepository = new FollowSummaryPgRepository()
  ) {}

  async get(userId: string): Promise<FollowSummary> {
    return await this.repository.get(userId);
  }
}
