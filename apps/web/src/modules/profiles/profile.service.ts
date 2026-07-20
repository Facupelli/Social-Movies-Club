import type { User } from '@/platform/database/postgres/schema';
import { ProfilePgRepository } from './profile.pg.repository';

export class ProfileService {
  constructor(
    private readonly repository: ProfilePgRepository =
      new ProfilePgRepository()
  ) {}

  async getUser(userId: string): Promise<User | null> {
    return await this.repository.getById(userId);
  }
}
