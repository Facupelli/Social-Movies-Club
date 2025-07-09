import type { ObjectId } from 'mongodb';
import { AuthUserRepository } from './auth-user-repository';
import type { AuthUserViewModel, UserViewModel } from './user.types';
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

  constructor() {
    this.userRepository = new UserRepository();
    this.authUserRepository = new AuthUserRepository();
  }

  async getUser(id: ObjectId): Promise<UserViewModel | null> {
    return await this.userRepository.findById(id);
  }

  async getAuthUser(id: ObjectId): Promise<AuthUserViewModel | null> {
    return await this.authUserRepository.findById(id);
  }

  //>

  async searchUsers(
    filter: Partial<UserViewModel>,
    page = 1,
    limit = 10
  ): Promise<{ data: UserViewModel[]; totalCount: number }> {
    return await this.userRepository.find(filter, page, limit);
  }
}
