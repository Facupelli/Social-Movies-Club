import {
	MovieCard,
	MoviePoster,
	MovieReleaseDate,
	MovieRuntime,
	MovieTitle,
} from "@/components/movies/movie-card";
import { MovieWatchProviders } from "@/components/movies/movie-watch-providers";
import { RateDialog } from "@/components/movies/rate-dialog";
import { CardContent } from "@/components/ui/card";
import type { MovieView } from "@/media/movie-view";
import { AddToWatchlistButton } from "./add-to-watchlist-button";

export function GridMovieCard({
	movie,
	isOwner,
}: {
	movie: MovieView;
	isOwner: boolean;
}) {
	return (
		<MovieCard>
			<MoviePoster posterPath={movie.posterPath} title={movie.title} />
			<CardContent className="flex flex-col gap-1 px-4 py-2">
				<MovieTitle title={movie.title} />
				<div className="flex items-center justify-between">
					<div className="flex w-full items-center justify-between gap-2">
						<MovieReleaseDate year={movie.year} />
						<MovieRuntime runtime={movie.runtime} type={movie.type} />
					</div>
					<AddToWatchlistButton tmdbId={movie.tmdbId} type={movie.type} />
				</div>
				<MovieWatchProviders tmdbId={movie.tmdbId} type={movie.type} />

				{isOwner && (
					<div>
						<RateDialog
							tmdbId={movie.tmdbId}
							title={movie.title}
							type={movie.type}
							year={movie.year}
						/>
					</div>
				)}
			</CardContent>
		</MovieCard>
	);
}
