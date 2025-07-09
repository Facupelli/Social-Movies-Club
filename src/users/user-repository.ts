// user-repository.ts
import type { ObjectId } from 'mongodb';
import { withDatabase } from '@/infra/mongo/db-utils';
import { Repository } from '@/infra/mongo/mongo-repository';
import type { MovieViewModel } from '@/movies/movie.type';
import type { UserDocument, UserViewModel } from './user.types';

export class UserRepository {
  private readonly usersCollection = 'app-users';
  private readonly base = new Repository<UserViewModel>(this.usersCollection);

  /* ---------- generic helpers re-exposed for convenience ---------- */

  findById = this.base.findById.bind(this.base);
  find = this.base.find.bind(this.base);

  /* --------------------------- domain API -------------------------- */

  async addMovie(userId: ObjectId, movie: MovieViewModel): Promise<void> {
    await withDatabase(async (db) => {
      await db.collection<UserDocument>(this.usersCollection).updateOne(
        { _id: userId }, // The query to find the user
        {
          $setOnInsert: { _id: userId }, // Sets the _id only on insert
          $push: { movies: movie }, // Pushes the movie to the array
        },
        { upsert: true } // The key option to enable upsert
      );
    });
  }
}
