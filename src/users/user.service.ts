import { Repository } from '@/infra/mongo/mongo-repository';
import type { UserViewModel } from './user.types';

export interface IUserService {
  searchUser(
    filter: Partial<UserViewModel>
  ): Promise<{ data: UserViewModel[]; totalCount: number }>;
}

export class UserService implements IUserService {
  private repository: Repository<UserViewModel>;

  constructor() {
    this.repository = new Repository<UserViewModel>('users');
  }

  async searchUser(
    filter: Partial<UserViewModel>,
    page = 1,
    limit = 10
  ): Promise<{ data: UserViewModel[]; totalCount: number }> {
    return await this.repository.find(filter, page, limit);
  }
}
