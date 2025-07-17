"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, StarIcon } from "lucide-react";
import { useActionState, useState } from "react";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { QUERY_KEYS } from "@/lib/app.constants";
import { addRatingToMovie } from "@/media/actions/add-rating";
import type { MediaType } from "@/media/media.type";
import { getUserRatingsQueryOptions } from "@/users/hooks/use-user-ratings";
import { SubmitButton } from "../submit-button";
import { Button } from "../ui/button";

const initialState = {
	success: false,
	error: "",
};

export function RateDialog({
	movieTMDBId,
	title,
	year,
	type,
}: {
	movieTMDBId: number;
	title: string;
	year: string;
	type: MediaType;
}) {
	const queryClient = useQueryClient();
	const { data: userRatings } = useQuery(getUserRatingsQueryOptions);

	const handleAddRatingToMovie = async (
		_state: typeof initialState,
		formData: FormData,
	) => {
		const result = await addRatingToMovie(formData);
		if (result.success) {
			queryClient.invalidateQueries({
				queryKey: QUERY_KEYS.USER_RATINGS,
			});
		}
		return result;
	};

	const [state, action, isPending] = useActionState(
		handleAddRatingToMovie,
		initialState,
	);

	const userRating = userRatings?.[movieTMDBId];
	const isMovieRated = userRating?.isRated;

	const [rating, setRating] = useState(userRating?.score ?? 0);
	const [hoverRating, setHoverRating] = useState(0);

	return (
		<Dialog>
			<DialogTrigger asChild className="cursor-pointer">
				<Button className="w-full bg-transparent" size="sm" variant="outline">
					{isMovieRated ? <Star className="fill-yellow-400" /> : <Star />}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{title}{" "}
						<span className="font-normal text-neutral-500 text-sm">{year}</span>
					</DialogTitle>
					<DialogDescription>
						Después de calificar esta película, se agregará a tu lista personal.
					</DialogDescription>
				</DialogHeader>

				<form className="md:pt-2">
					<input name="movieTMDBId" type="hidden" value={movieTMDBId} />
					<input name="type" type="hidden" value={type} />

					<p className="sr-only">
						Use the number keys 1 through 10 to select a rating.
					</p>

					<fieldset className="mb-6">
						<legend className="sr-only">Rating</legend>
						<div
							className="flex items-center justify-center space-x-1 sm:space-x-2"
							onMouseLeave={() => setHoverRating(0)}
							role="radiogroup"
						>
							{[...Array(10)].map((_, index) => {
								const ratingValue = index + 1;
								return (
									// biome-ignore lint: reason
									<label
										className="cursor-pointer"
										key={ratingValue}
										onMouseEnter={() => setHoverRating(ratingValue)}
									>
										<input
											aria-label={`${ratingValue} out of 10`}
											checked={rating === ratingValue}
											className="sr-only"
											name="rating"
											onChange={() => setRating(ratingValue)}
											type="radio"
											value={ratingValue}
										/>
										<StarIcon
											className={`size-6 transition-colors duration-200 sm:h-8 sm:w-8 md:size-7 ${
												ratingValue <= (hoverRating || rating)
													? "fill-yellow-400 text-yellow-400"
													: "text-gray-300 dark:text-gray-600"
											} rounded-full focus-within:outline-none focus-within:ring-2 focus-within:ring-yellow-500 focus-within:ring-offset-2 focus-within:ring-offset-white hover:text-yellow-300 dark:hover:text-yellow-500 dark:focus-within:ring-offset-gray-800`}
										/>
									</label>
								);
							})}
						</div>
					</fieldset>

					<DialogFooter className="gap-2 md:gap-6">
						<DialogClose asChild>
							<Button type="button" variant="secondary">
								Cancelar
							</Button>
						</DialogClose>

						<SubmitButton
							disabled={rating === 0 || isPending}
							formAction={action}
							loadingText="Calificando"
						>
							Calificar
						</SubmitButton>
					</DialogFooter>

					{!state.success && state.error && (
						<div className="flex justify-center pt-2 md:justify-end">
							<p className="text-red-500">
								{state.error === "Unauthorized"
									? "Debes inciar sesión para calificar"
									: state.error}
							</p>
						</div>
					)}
					{state.success && (
						<div className="flex justify-center pt-2 md:justify-end">
							<p className="text-green-500">Calificaste esta película!</p>
						</div>
					)}
				</form>
			</DialogContent>
		</Dialog>
	);
}
