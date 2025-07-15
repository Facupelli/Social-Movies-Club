// user-repository.ts
import { Repository } from '@/infra/mongo/mongo-repository';
import type { AuthUserViewModel } from './user.types';

export class AuthUserRepository {
  private readonly usersCollection = 'user';
  private readonly base = new Repository<AuthUserViewModel>(
    this.usersCollection
  );

  /* ---------- generic helpers re-exposed for convenience ---------- */

  findById = this.base.findById.bind(this.base);
}
