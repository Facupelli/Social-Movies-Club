import z from 'zod';
import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from '@/modules/account/username-policy';

const GetUserFeedQuerySchema = z.object({
  cursor: z
    .string()
    .refine(
      (val) => {
        if (val === '') {
          return false;
        }
        return !Number.isNaN(Date.parse(val));
      },
      { message: 'cursor must be a valid ISO 8601 timestamp' }
    )
    .nullable()
    .optional(),
});

export type GetUserFeedQueryInput = z.infer<typeof GetUserFeedQuerySchema>;

export function validateGetUserFeedQuery(
  searchParams: URLSearchParams
): GetUserFeedQueryInput {
  const data = Object.fromEntries(searchParams.entries());
  return GetUserFeedQuerySchema.parse(data);
}

const FollowUserSchema = z.object({
  followedUserId: z.string().nonempty(),
});

export type FollowUserInput = z.infer<typeof FollowUserSchema>;

export function validateFollowUser(formData: FormData): FollowUserInput {
  const data = Object.fromEntries(formData.entries());
  return FollowUserSchema.parse(data);
}

const UsernameSchema = z
  .string({ error: 'Ingresa un nombre de usuario.' })
  .trim()
  .transform((username) =>
    username.startsWith('@') ? username.slice(1) : username
  )
  .transform((username) => username.toLowerCase())
  .pipe(
    z
      .string()
      .min(
        USERNAME_MIN_LENGTH,
        `El nombre de usuario debe tener al menos ${USERNAME_MIN_LENGTH} caracteres.`
      )
      .max(
        USERNAME_MAX_LENGTH,
        `El nombre de usuario debe tener como máximo ${USERNAME_MAX_LENGTH} caracteres.`
      )
      .regex(
        /^[a-z0-9][a-z0-9_]*$/,
        'Usa solo letras, números o guiones bajos, y comienza con una letra o un número.'
      )
  )
  .transform((username) => `@${username}`);

const UpsertUsernameSchema = z.object({
  username: UsernameSchema,
});

export type UpsertUsernameInput = z.infer<typeof UpsertUsernameSchema>;

export function validateUpdateUsername(
  formData: FormData
): UpsertUsernameInput {
  const data = Object.fromEntries(formData.entries());
  return UpsertUsernameSchema.parse(data);
}
