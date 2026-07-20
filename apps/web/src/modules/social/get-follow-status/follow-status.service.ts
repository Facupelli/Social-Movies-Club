import { FollowStatusPgRepository } from './follow-status.pg.repository';

export class FollowStatusService {
  constructor(
    private readonly repository: FollowStatusPgRepository = new FollowStatusPgRepository()
  ) {}

  async get(userId: string, followedUserId: string): Promise<boolean> {
    return await this.repository.get(userId, followedUserId);
  }
}
