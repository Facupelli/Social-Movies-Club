import type { SortBy, SortOrder } from "@/app/profile/[id]/page";
import type { User } from "@/infra/neon/schema";
import { AuthUserRepository } from "./auth-user.repository";
import { UserPgRepository } from "./user.pg.repository";
import type { FeedItem, GetUserFeedParams, UserRatings } from "./user.types";

export class UserService {
  private userPgRepository: UserPgRepository;
  private authUserRepository: AuthUserRepository;

  constructor() {
    this.userPgRepository = new UserPgRepository();
    this.authUserRepository = new AuthUserRepository();
  }

  async getUser(id: string): Promise<User | null> {
    return await this.userPgRepository.getUserById(id);
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
    sortBy?: SortBy,
    sortOrder?: SortOrder
  ): Promise<UserRatings[]> {
    return await this.userPgRepository.getUserRatingMovies(userId, {
      field: sortBy,
      dir: sortOrder,
    });
  }
}
