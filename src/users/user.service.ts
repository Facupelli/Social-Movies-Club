import type { Document, ObjectId, WithId } from 'mongodb';
import { AuthUserRepository } from './auth-user.repository';
import type { AuthUserViewModel, UserViewModel } from './user.types';
import { UserRelationshipRepository } from './user-relationships.repository';
import { UserRepository } from './user-repository';

export interface IUserService {
  searchUsers(
    filter: Partial<UserViewModel>
  ): Promise<{ data: UserViewModel[]; totalCount: number }>;

  getUser(userId: ObjectId): Promise<UserViewModel | null>;
}

export class UserService implements IUserService {
  private userRepository: UserRepository;
  private authUserRepository: AuthUserRepository;
  private userRelationshipRepository: UserRelationshipRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.authUserRepository = new AuthUserRepository();
    this.userRelationshipRepository = new UserRelationshipRepository();
  }

  async getUser(id: ObjectId): Promise<UserViewModel | null> {
    return await this.userRepository.findById(id);
  }

  async getAuthUser(id: ObjectId): Promise<AuthUserViewModel | null> {
    return await this.authUserRepository.findById(id);
  }

  async searchUsers(
    filter: Partial<UserViewModel>,
    page = 1,
    limit = 10
  ): Promise<{ data: UserViewModel[]; totalCount: number }> {
    return await this.userRepository.find(filter, page, limit);
  }

  async getFollowingUsers(userId: ObjectId): Promise<WithId<Document>[]> {
    return await this.userRelationshipRepository.getFollowingUsers(userId);
  }

  async isFollowingUser(
    userId: ObjectId,
    followedUserId: ObjectId
  ): Promise<boolean> {
    return await this.userRelationshipRepository.isFollowingUser(
      userId,
      followedUserId
    );
  }

  async followUser(userId: ObjectId, followedUserId: ObjectId): Promise<void> {
    const isFollowingUser =
      await this.userRelationshipRepository.isFollowingUser(
        userId,
        followedUserId
      );

    if (isFollowingUser) {
      throw new Error('User is already being followed');
    }

    await this.userRelationshipRepository.followUser(userId, followedUserId);
  }
}
