import type { UserViewModel } from './user.types';
import { UserRepository } from './user-repository';

export interface IUserService {
  searchUser(
    filter: Partial<UserViewModel>
  ): Promise<{ data: UserViewModel[]; totalCount: number }>;
}

export class UserService implements IUserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async searchUser(
    filter: Partial<UserViewModel>,
    page = 1,
    limit = 10
  ): Promise<{ data: UserViewModel[]; totalCount: number }> {
    return await this.userRepository.find(filter, page, limit);
  }
}
