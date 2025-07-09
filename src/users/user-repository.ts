// user-repository.ts
import type { ObjectId } from 'mongodb';
import { withDatabase } from '@/infra/mongo/db-utils';
import { Repository } from '@/infra/mongo/mongo-repository';
import type { MovieViewModel } from '@/movies/movie.type';
import type { UserDocument, UserViewModel } from './user.types';

export class UserRepository {
  private readonly base = new Repository<UserViewModel>('users');

  /* ---------- generic helpers re-exposed for convenience ---------- */

  find = this.base.find.bind(this.base);

  /* --------------------------- domain API -------------------------- */

  async addMovie(userId: ObjectId, movie: MovieViewModel): Promise<void> {
    await withDatabase(async (db) => {
      await db
        .collection<UserDocument>('users')
        .updateOne(
          { _id: userId, 'movies.id': { $ne: movie.id } },
          { $push: { movies: movie } }
        );
    });
  }
}
