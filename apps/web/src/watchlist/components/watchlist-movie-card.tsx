"use client";

import { MovieCard, type MovieView } from "@/components/movies/movie-card";
import { CardContent } from "@/components/ui/card";
import { useIsOwner } from "@/lib/hooks/use-is-owner";

export function GridMovieCard({ movie }: { movie: MovieView }) {
	const { isOwner } = useIsOwner();

	return (
		<MovieCard key={movie.tmdbId} movie={movie}>
			<MovieCard.Poster />
			<CardContent className="flex flex-col gap-1 px-4 py-2">
				<MovieCard.Title />
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<MovieCard.ReleaseDate />
						<MovieCard.Runtime />
					</div>
					<MovieCard.WatchlistButton />
				</div>
				<MovieCard.WatchProviders />

				{isOwner && (
					<div>
						<MovieCard.Rate />
					</div>
				)}
			</CardContent>
		</MovieCard>
	);
}
