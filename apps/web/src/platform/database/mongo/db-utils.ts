import type { Db, WithId } from 'mongodb';
import { getDatabase } from './mongo-client-provider';

export class DatabaseError extends Error {
  readonly code: string;

  constructor(message: string, code = 'DB_ERROR') {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
  }
}

export type DatabaseOperation<T> = (db: Db) => Promise<T>;

export async function withDatabase<T>(
  operation: DatabaseOperation<T>
): Promise<T> {
  try {
    const db = await getDatabase();
    return await operation(db);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const errorCode =
      error instanceof Error && 'code' in error
        ? (error.code as string)
        : 'DB_OPERATION_ERROR';

    throw new DatabaseError(
      `Database operation failed: ${errorMessage}`,
      errorCode || 'DB_OPERATION_ERROR'
    );
  }
}

export function toViewModel<T>(doc: WithId<Document>): T {
  const { _id, ...rest } = doc;

  return {
    id: _id.toHexString(),
    ...rest,
  } as T;
}
