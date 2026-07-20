import z from 'zod';

const addMovieToWatchlistSchema = z.object({
  movieTMDBId: z
    .string()
    .regex(/^\d+$/, 'Movie ID must be a valid number')
    .transform(Number),
  userId: z.string().nonempty(),
  type: z.enum(['movie', 'tv']),
});

export type AddMovieToWatchlistInput = z.infer<
  typeof addMovieToWatchlistSchema
>;

export function validateAddMovieToWatchlist(
  formData: FormData
): AddMovieToWatchlistInput {
  const data = Object.fromEntries(formData.entries());
  return addMovieToWatchlistSchema.parse(data);
}

const removeMovieToWatchlistSchema = z.object({
  movieTMDBId: z
    .string()
    .regex(/^\d+$/, 'Movie ID must be a valid number')
    .transform(Number),
  userId: z.string().nonempty(),
});

export type removeMovieFromWatchlistInput = z.infer<
  typeof removeMovieToWatchlistSchema
>;

export function validateRemoveMovieFromWatchlist(
  formData: FormData
): removeMovieFromWatchlistInput {
  const data = Object.fromEntries(formData.entries());
  return removeMovieToWatchlistSchema.parse(data);
}
