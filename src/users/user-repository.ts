import type { ObjectId } from 'mongodb';
import { toViewModel, withDatabase } from '@/infra/mongo/db-utils';
import { Repository } from '@/infra/mongo/mongo-repository';
import type { MovieViewModel } from '@/movies/movie.type';
import type { UserDocument, UserViewModel } from './user.types';

export type UserSortBy = 'rating' | 'addedAt';
export type UserSortOrder = 'asc' | 'desc';

export class UserRepository {
  private readonly collection = 'app-users';
  private readonly base = new Repository<UserViewModel>(this.collection);

  /* ---------- generic helpers re-exposed for convenience ---------- */

  find = this.base.find.bind(this.base);

  /* --------------------------- domain API -------------------------- */

  async findById(
    id: ObjectId,
    sortBy?: UserSortBy,
    sortOrder?: UserSortOrder
  ): Promise<UserViewModel | null> {
    return await withDatabase(async (db) => {
      const collection = db.collection(this.collection);
      const raw = await collection.findOne({ _id: id });

      if (!raw) {
        return null;
      }

      // @ts-expect-error reason
      const user = toViewModel<UserViewModel>(raw);

      if (sortBy && user.movies && user.movies.length > 0) {
        // biome-ignore lint: good complexity
        user.movies.sort((a, b) => {
          let comparison = 0;

          switch (sortBy) {
            case 'rating':
              if (a.rating === null && b.rating === null) {
                return 0;
              }
              if (a.rating === null) {
                return 1;
              }
              if (b.rating === null) {
                return -1;
              }
              comparison = a.rating - b.rating;
              break;

            case 'addedAt':
              comparison = a.addedAt.getTime() - b.addedAt.getTime();
              break;

            default:
              return 0;
          }

          return sortOrder === 'desc' ? -comparison : comparison;
        });
      }

      return user;
    });
  }

  async addMovie(userId: ObjectId, movie: MovieViewModel): Promise<void> {
    await withDatabase(async (db) => {
      await db.collection<UserDocument>(this.collection).updateOne(
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
