import type { ObjectId } from 'mongodb';
import { toViewModel, withDatabase } from './db-utils';

interface IRepository<T> {
  find(
    filter: Partial<T>,
    page: number,
    limit: number,
    projection?: Partial<Record<keyof T, 1 | 0>>
  ): Promise<{ data: T[]; totalCount: number }>;
}

export class Repository<T> implements IRepository<T> {
  private collection: string;

  constructor(collection: string) {
    this.collection = collection;
  }

  async findById(id: ObjectId): Promise<T | null> {
    return await withDatabase(async (db) => {
      const collection = db.collection(this.collection);
      const raw = await collection.findOne({ _id: id });
      // @ts-expect-error reason
      return raw ? toViewModel(raw) : null;
    });
  }

  async find(
    filter: Partial<T>,
    page = 1,
    limit = 10,
    projection?: Partial<Record<keyof T, 1 | 0>>
  ): Promise<{ data: T[]; totalCount: number }> {
    return await withDatabase(async (db) => {
      const skip = (page - 1) * limit;

      const collection = db.collection(this.collection);

      const totalCount = await collection.countDocuments(filter);

      const raw = await collection
        .find(filter, { projection })
        .skip(skip)
        .limit(limit)
        .toArray();

      // @ts-expect-error reason
      return { data: raw.map(toViewModel), totalCount };
    });
  }
}
