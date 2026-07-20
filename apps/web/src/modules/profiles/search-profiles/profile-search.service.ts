import type { User } from '@/platform/database/postgres/schema';
import { ProfileSearchPgRepository } from './profile-search.pg.repository';

export class ProfileSearchService {
  constructor(
    private readonly repository: ProfileSearchPgRepository =
      new ProfileSearchPgRepository()
  ) {}

  async search(query: string): Promise<User[]> {
    return await this.repository.search(query);
  }
}
