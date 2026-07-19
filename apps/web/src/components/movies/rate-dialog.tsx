"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleCheck, Star, StarIcon } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth/auth-client";
import {
	invalidateAfterRating,
	optimisticallyRateMedia,
} from "@/lib/react-query/mutation-cache";
import type { ApiResponse } from "@/lib/safe-execute";
import { addRatingToMovie } from "@/media/actions/add-rating";
import { type MediaType, MediaTypeDict } from "@/media/media.type";
import { getUserRatingsQueryOptions } from "@/users/hooks/use-user-ratings";
import { SubmitButton } from "../submit-button";
import { Button } from "../ui/button";

const initialState: ApiResponse<void> = {
	success: false,
	error: "",
};

export function RateDialog({
	tmdbId,
	title,
	type,
	year,
}: {
	tmdbId: number;
	title: string;
	type: MediaType;
	year: string;
}) {
	const { data: session } = authClient.useSession();

	const queryClient = useQueryClient();
	const { data: userRatings } = useQuery(
		getUserRatingsQueryOptions(session?.user.id),
	);

	const handleAddRatingToMovie = async (
		_state: ApiResponse<void>,
		formData: FormData,
	) => {
		const userId = session?.user.id;
		const rollback = userId
			? await optimisticallyRateMedia(queryClient, {
					userId,
					tmdbId,
					score: rating,
				})
			: undefined;

		try {
			const result = await addRatingToMovie(formData);
			if (!result.success) {
				rollback?.();
				return result;
			}

			if (userId) {
				await invalidateAfterRating(queryClient, userId);
			}

			return result;
		} catch (error) {
			rollback?.();
			throw error;
		}
	};

	const [state, action, isPending] = useActionState(
		handleAddRatingToMovie,
		initialState,
	);

	const userRating = userRatings?.[tmdbId];
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
				{state.success ? (
					<RatingSuccessView rating={rating} userId={session?.user.id} />
				) : (
					<>
						<DialogHeader>
							<div className="space-y-1">
								<DialogTitle className="text-2xl">{title}</DialogTitle>
								<div className="font-normal flex items-center gap-1 justify-center uppercase text-neutral-500 text-xs">
									<span className="">{MediaTypeDict[type]}</span>
									<span className="">-</span>
									<span className="font-normal text-neutral-500 text-sm">
										{year}
									</span>
								</div>
							</div>

							<div>
								<p className="font-medium flex items-center gap-1 justify-center">
									<span className="font-bold text-2xl text-primary">
										{rating}
									</span>
									<span className="text-xl text-muted-foreground">/</span>
									<span className="text-muted-foreground">10</span>
								</p>
							</div>
						</DialogHeader>

						<form className="md:pt-2">
							<input name="movieTMDBId" type="hidden" value={tmdbId} />
							<input name="type" type="hidden" value={type} />

							<p className="sr-only">
								Use the number keys 1 through 10 to select a rating.
							</p>

							<fieldset className="">
								<legend className="sr-only">Rating</legend>
								<div
									className="flex items-center justify-center space-x-1 sm:space-x-2"
									onMouseLeave={() => setHoverRating(0)}
									role="radiogroup"
								>
									{[...Array(10)].map((_, index) => {
										const ratingValue = index + 1;
										return (
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

							<div className="text-muted-foreground text-sm text-center pt-6 pb-4">
								Después de calificar esta película, se agregará a tu lista
								personal.
							</div>

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
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}

function RatingSuccessView({
	rating,
	userId,
}: {
	rating: number;
	userId?: string;
}) {
	return (
		<>
			<DialogHeader>
				<div className="grid place-items-center gap-y-2">
					<CircleCheck className="size-12 text-primary" />
					<div>
						<DialogTitle className="text-lg font-bold text-center">
							Calificación Subida!
						</DialogTitle>
						<p className="text-muted-foreground text-sm text-center">
							Gracias! Tu calificación{" "}
							<span className="text-primary font-semibold text-base">
								{rating}/10
							</span>{" "}
							fue guardada
						</p>
					</div>
				</div>
			</DialogHeader>
			<div className="grid gap-y-3">
				<DialogClose asChild>
					<Button type="button" variant="secondary">
						Listo
					</Button>
				</DialogClose>
				{userId && (
					<Link
						href={`/profile/${userId}`}
						className="text-sm text-muted-foreground text-center hover:underline"
					>
						Ver tus calificaciones
					</Link>
				)}
			</div>
		</>
	);
}
