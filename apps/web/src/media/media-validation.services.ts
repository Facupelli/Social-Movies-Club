import z from "zod";

const MovieRatingSchema = z.object({
	movieTMDBId: z
		.string()
		.regex(/^\d+$/, "Movie ID must be a valid number")
		.transform(Number),
	rating: z
		.string()
		.regex(/^\d+$/, "Rating must be a valid number")
		.transform(Number)
		.refine((value) => value >= 1 && value <= 10, {
			message: "Rating must be between 1 and 10",
		}),
	type: z.enum(["movie", "tv"]),
});

export type MovieRatingInput = z.infer<typeof MovieRatingSchema>;

export function validateMovieRating(formData: FormData): MovieRatingInput {
	const data = Object.fromEntries(formData.entries());
	return MovieRatingSchema.parse(data);
}
