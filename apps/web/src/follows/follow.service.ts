import type { Follow } from "@/infra/postgres/schema";
import { FollowsPgRepository } from "./follows.pg.repository";

export class FollowService {
  private followPgRepository: FollowsPgRepository;

  constructor() {
    this.followPgRepository = new FollowsPgRepository();
  }

  async getFollowingUsers(userId: string): Promise<Follow[]> {
    return await this.followPgRepository.getFollowingUsers(userId);
  }

  async isFollowingUser(
    userId: string,
    followedUserId: string
  ): Promise<boolean> {
    return await this.followPgRepository.isFollowingUser(
      userId,
      followedUserId
    );
  }

  async followUser(userId: string, followedUserId: string): Promise<void> {
    const isFollowingUser = await this.followPgRepository.isFollowingUser(
      userId,
      followedUserId
    );

    if (isFollowingUser) {
      throw new Error("User is already being followed");
    }

    await this.followPgRepository.followUser(userId, followedUserId);
  }
}
