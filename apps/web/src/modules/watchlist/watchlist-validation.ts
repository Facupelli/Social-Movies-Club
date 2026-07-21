import z from 'zod';

const watchlistMutationSchema = z.object({
  movieTMDBId: z
    .string()
    .regex(/^\d+$/, 'Movie ID must be a valid number')
    .transform(Number)
    .refine((value) => Number.isSafeInteger(value) && value > 0, {
      message: 'Movie ID must be a positive integer',
    }),
  type: z.enum(['movie', 'tv']),
});

export type WatchlistMutationInput = z.infer<
  typeof watchlistMutationSchema
>;

export function validateWatchlistMutation(
  formData: FormData
): WatchlistMutationInput {
  return watchlistMutationSchema.parse(Object.fromEntries(formData.entries()));
}
