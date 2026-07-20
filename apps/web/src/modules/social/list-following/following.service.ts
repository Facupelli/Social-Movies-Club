import { FollowingPgRepository } from './following.pg.repository';
import type { FollowingUser } from './following.types';

export class FollowingService {
  constructor(
    private readonly repository: FollowingPgRepository = new FollowingPgRepository()
  ) {}

  async list(userId: string, viewerUserId: string): Promise<FollowingUser[]> {
    return await this.repository.list(userId, viewerUserId);
  }
}
