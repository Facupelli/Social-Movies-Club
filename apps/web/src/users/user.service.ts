import type { User } from "@/infra/postgres/schema";
import { UserPgRepository } from "./user.pg.repository";
import type {
	FeedItem,
	GetUserFeedParams,
	GetUserRatingMovies,
	GetUserRatingMoviesFilters,
} from "./user.types";

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

	async getUserRatingMovies(
		userId: string,
		filters?: GetUserRatingMoviesFilters,
	): Promise<GetUserRatingMovies> {
		return await this.userPgRepository.getRatingMovies(userId, filters);
	}

	async rateMovie(userId: string, movieId: bigint, score: number) {
		return await this.userPgRepository.rateMovie(userId, movieId, score);
	}

	async updateUsername(userId: string, username: string) {
		return await this.userPgRepository.updatetUsername(userId, username);
	}
}
