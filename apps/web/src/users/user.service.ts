import type { SortBy, SortOrder } from "@/app/profile/[id]/page";
import type { User } from "@/infra/neon/schema";
import {
  type GetUserFollowsInfoMap,
  UserPgRepository,
} from "./user.pg.repository";
import type { FeedItem, GetUserFeedParams, UserRatings } from "./user.types";

export class UserService {
  private userPgRepository: UserPgRepository;

  constructor() {
    this.userPgRepository = new UserPgRepository();
  }

  async getUser(userId: string): Promise<User | null> {
    return await this.userPgRepository.getUserById(userId);
  }

  async getUserFollowsInfo(userId: string): Promise<GetUserFollowsInfoMap> {
    return await this.userPgRepository.getUserFollowsInfo(userId);
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
