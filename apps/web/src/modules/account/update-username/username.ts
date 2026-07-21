import 'server-only';

import { ZodError } from 'zod';
import { validateUpdateUsername } from '@/modules/account/user-validation';
import { DatabaseError } from '@/platform/database/postgres/db-utils';
import { persistUsername } from './username.pg';

const USERNAME_TAKEN_ERROR = 'Ese nombre de usuario ya está en uso.';
const USERNAME_UNKNOWN_ERROR =
  'No pudimos guardar el nombre de usuario. Inténtalo de nuevo.';

export class UsernameApplicationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UsernameApplicationError';
  }
}

export async function saveUsername(
  userId: string,
  formData: FormData
): Promise<void> {
  try {
    const { username } = validateUpdateUsername(formData);
    await persistUsername(userId, username);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new UsernameApplicationError(
        error.issues[0]?.message ?? 'El nombre de usuario no es válido.'
      );
    }

    if (error instanceof DatabaseError && error.code === '23505') {
      throw new UsernameApplicationError(USERNAME_TAKEN_ERROR);
    }

    throw new UsernameApplicationError(USERNAME_UNKNOWN_ERROR);
  }
}
