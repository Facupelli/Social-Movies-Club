import type { User } from "@/platform/database/postgres/schema";
import type { AggregatedFeedItem } from "@/modules/timeline/view-timeline/feed.types";
import { UserPgRepository } from "./user.pg.repository";
import type { FeedItem, GetUserFeedParams } from "./user.types";

export class UserService {
	private userPgRepository: UserPgRepository;

	constructor() {
		this.userPgRepository = new UserPgRepository();
	}

	async getUsers(query: string): Promise<User[]> {
		return await this.userPgRepository.getUsers(query);
	}

	async getUser(userId: string): Promise<User | null> {
		return await this.userPgRepository.getById(userId);
	}

	async getAggregatedFeed(params: GetUserFeedParams): Promise<{
		items: AggregatedFeedItem[];
		nextCursor: string | null;
	}> {
		return await this.userPgRepository.getAggregatedFeed(params);
	}

	async getFeed(params: GetUserFeedParams): Promise<{
		items: FeedItem[];
		nextCursor: string | null;
	}> {
		return await this.userPgRepository.getFeed(params);
	}

	// async searchUsers(
	//   filter: Partial<UserViewModel>,
	//   page = 1,
	//   limit = 10
	// ): Promise<{ data: UserViewModel[]; totalCount: number }> {
	//   return await this.userRepository.find(filter, page, limit);
	// }

	async updateUsername(userId: string, username: string) {
		return await this.userPgRepository.updatetUsername(userId, username);
	}
}
