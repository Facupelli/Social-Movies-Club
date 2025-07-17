import { FollowsPgRepository } from "./follows.pg.repository";
import type { GetFollowingUsers, GetUserFollowsInfoMap } from "./follows.type";

export class FollowService {
	private followPgRepository: FollowsPgRepository;

	constructor() {
		this.followPgRepository = new FollowsPgRepository();
	}

	async getFollowingUsers(userId: string): Promise<GetFollowingUsers[]> {
		return await this.followPgRepository.getFollowingUsers(userId);
	}

	async getUserFollowsInfo(userId: string): Promise<GetUserFollowsInfoMap> {
		return await this.followPgRepository.getUserFollowsInfo(userId);
	}

	async isFollowingUser(
		userId: string,
		followedUserId: string,
	): Promise<boolean> {
		return await this.followPgRepository.isFollowingUser(
			userId,
			followedUserId,
		);
	}

	async followUser(userId: string, followedUserId: string): Promise<void> {
		const isFollowingUser = await this.followPgRepository.isFollowingUser(
			userId,
			followedUserId,
		);

		if (isFollowingUser) {
			throw new Error("User is already being followed");
		}

		await this.followPgRepository.followUser(userId, followedUserId);
	}

	async unfollowUser(userId: string, followedUserId: string): Promise<void> {
		const isFollowingUser = await this.followPgRepository.isFollowingUser(
			userId,
			followedUserId,
		);

		if (!isFollowingUser) {
			throw new Error("User is not followed");
		}

		await this.followPgRepository.unfollowUser(userId, followedUserId);
	}
}
