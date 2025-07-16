import type { User } from "@/infra/postgres/schema";
import { UserPgRepository } from "./user.pg.repository";
import type {
  FeedItem,
  GetUserFeedParams,
  GetUserRatingMovies,
  GetUserRatingMoviesFilters,
  UserMoviesSortBy,
  UserMoviesSortOrder,
  UserRatings,
} from "./user.types";

export class UserService {
  private userPgRepository: UserPgRepository;

  constructor() {
    this.userPgRepository = new UserPgRepository();
  }

  async getUser(userId: string): Promise<User | null> {
    return await this.userPgRepository.getUserById(userId);
  }

  async getFeed(params: GetUserFeedParams): Promise<{
    items: FeedItem[];
    nextCursor: string | null;
  }> {
    return await this.userPgRepository.getUserFeed(params);
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
    filters?: GetUserRatingMoviesFilters
  ): Promise<GetUserRatingMovies> {
    return await this.userPgRepository.getUserRatingMovies(userId, filters);
  }
}
