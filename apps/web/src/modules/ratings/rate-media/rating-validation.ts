import z from 'zod';

function getTodayDate(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const MovieRatingSchema = z.object({
  movieTMDBId: z
    .string()
    .regex(/^\d+$/, 'Movie ID must be a valid number')
    .transform(Number)
    .refine((value) => Number.isSafeInteger(value) && value > 0, {
      message: 'Movie ID must be a positive integer',
    }),
  rating: z
    .string()
    .regex(/^\d+$/, 'Rating must be a valid number')
    .transform(Number)
    .refine((value) => value >= 1 && value <= 10, {
      message: 'Rating must be between 1 and 10',
    }),
  type: z.enum(['movie', 'tv']),
  watchedDate: z.iso
    .date('Watched date must be a valid date')
    .refine((value) => value <= getTodayDate(), {
      message: 'Watched date cannot be in the future',
    }),
});

export type MovieRatingInput = z.infer<typeof MovieRatingSchema>;

export function validateMovieRating(formData: FormData): MovieRatingInput {
  const data = Object.fromEntries(formData.entries());
  return MovieRatingSchema.parse(data);
}
