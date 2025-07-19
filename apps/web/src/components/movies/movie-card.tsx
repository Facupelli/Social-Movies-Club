"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { createContext, useActionState, useContext } from "react";
import { QUERY_KEYS } from "@/lib/app.constants";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useMediaWatchProviders } from "@/media/hooks/use-media-watch-providers";
import { type MediaType, MediaTypeEnum } from "@/media/media.type";
import { getUserWatchlistQueryOptions } from "@/users/hooks/use-user-watchlist";
import { addMovieToWatchlist } from "@/watchlist/actions/add-movie";
import { removeMovieFromWatchlist } from "@/watchlist/actions/remove-movie";
import { SubmitButton } from "../submit-button";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "../ui/accordion";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { RateDialog } from "./rate-dialog";

export interface MovieView {
	tmdbId: number; //  TMDB‐ID
	title: string;
	year: string;
	posterPath: string;
	backdropPath: string;
	score?: number;
	overview: string;
	type: MediaType;
}

type MovieCardContextType = {
	movie: MovieView;
};

const MovieCardContext = createContext<MovieCardContextType | undefined>(
	undefined,
);

function useMovieCardContext() {
	const context = useContext(MovieCardContext);
	if (!context) {
		throw new Error(
			"useMovieCardContext must be used within a MovieCard.Provider",
		);
	}
	return context;
}

export function MovieCard({
	children,
	movie,
	className,
}: {
	children: React.ReactNode;
	movie: MovieView;
	className?: string;
}) {
	return (
		<MovieCardContext.Provider value={{ movie }}>
			<Card className={cn("gap-2 overflow-hidden rounded-xs p-0", className)}>
				{children}
			</Card>
		</MovieCardContext.Provider>
	);
}

function Poster({ size = "default" }: { size?: "small" | "default" }) {
	const { movie } = useMovieCardContext();

	const dimensions =
		size === "small"
			? { width: 120, height: 180 }
			: { width: 250, height: 300 };

	return movie.posterPath ? (
		<div className="shrink-0">
			<Image
				alt={movie.title}
				className={clsx("rounded-xs")}
				height={dimensions.height}
				src={`https://image.tmdb.org/t/p/original${movie.posterPath}`}
				unoptimized
				width={dimensions.width}
			/>
		</div>
	) : (
		<div className="h-[350px] w-[250px] bg-gray-600" />
	);
}

function Title({ className }: { className?: string }) {
	const { movie } = useMovieCardContext();
	return (
		<p
			className={cn(
				"line-clamp-2 font-semibold text-pretty leading-tight md:text-lg",
				className,
			)}
		>
			{movie.title}
		</p>
	);
}

function ReleaseDate() {
	const { movie } = useMovieCardContext();
	return (
		<div className="flex items-center justify-between">
			<span className="font-medium text-muted-foreground text-sm">
				{movie.year}
			</span>
		</div>
	);
}

function Overview() {
	const { movie } = useMovieCardContext();

	return (
		<Accordion collapsible type="single">
			<AccordionItem value="item-1">
				<AccordionTrigger className="py-0 pb-2">Sinopsis</AccordionTrigger>
				<AccordionContent>{movie.overview}</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}

function Score() {
	const { movie } = useMovieCardContext();

	if (!movie.score) {
		return null;
	}

	return (
		<div className="flex size-7 items-center justify-center rounded bg-primary md:size-9">
			<p className="font-bold text-sm md:text-xl">{movie.score}</p>
		</div>
	);
}

function WatchProviders() {
	const { movie } = useMovieCardContext();
	const {
		data: watchProviders,
		isLoading,
		error,
		refetch,
	} = useMediaWatchProviders(movie.tmdbId, movie.type);

	if (error) {
		return (
			<div className="text-muted-foreground text-xs">
				Error, vas a tener que googlear
			</div>
		);
	}

	const hasFlatRateProviders =
		watchProviders?.data?.flatrate && watchProviders.data.flatrate.length > 0;

	return (
		<div className="md:space-y-2">
			<div className="flex flex-wrap gap-x-2">
				<Button className="h-auto p-0" onClick={() => refetch()} variant="link">
					Donde ver?
				</Button>

				{/* JustWatch Attribution */}
				<div className="flex items-center gap-2 text-muted-foreground text-xs">
					<span>by</span>
					<a
						className="inline-flex shrink-0 items-center gap-1 transition-opacity hover:opacity-80"
						href={"todo"}
						rel="noopener noreferrer"
						target="_blank"
					>
						<Image
							alt="JustWatch"
							className="h-auto"
							height={10}
							src="https://widget.justwatch.com/assets/JW_logo_color_10px.svg"
							width={60}
						/>
					</a>
				</div>
			</div>

			{isLoading && (
				<div className="flex flex-wrap gap-1 py-1">
					{[...Array(3)].map((_, idx) => (
						// biome-ignore lint:reason
						<div key={idx}>
							<Skeleton className="size-[30px] rounded-sm" />{" "}
						</div>
					))}
				</div>
			)}

			{watchProviders?.data && (
				<div className="flex flex-wrap py-1 gap-1">
					{hasFlatRateProviders ? (
						watchProviders.data.flatrate?.map((provider) => (
							<div key={provider.provider_id}>
								<Image
									alt={provider.provider_name}
									className={clsx("h-auto rounded-sm")}
									height={30}
									src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
									unoptimized
									width={30}
								/>
							</div>
						))
					) : (
						<div className="text-muted-foreground text-xs">
							No esta en ninguna plataforma :(
						</div>
					)}
				</div>
			)}
		</div>
	);
}

const initialState = {
	success: false,
	error: "",
};

function WatchlistButton() {
	const queryClient = useQueryClient();
	const { movie } = useMovieCardContext();
	const { data: session } = authClient.useSession();
	const { data: userWatchlist } = useQuery(getUserWatchlistQueryOptions);

	const handleAddMovieToWatchlist = async (
		_state: typeof initialState,
		formData: FormData,
	) => {
		const result = await addMovieToWatchlist(formData);
		if (result.success) {
			queryClient.invalidateQueries({
				queryKey: QUERY_KEYS.USER_WATCHLIST,
			});
		}

		return result;
	};

	const [_, addAction] = useActionState(handleAddMovieToWatchlist, {
		success: false,
		error: "",
	});

	const [__, removeAction] = useActionState(removeMovieFromWatchlist, {
		success: false,
		error: "",
	});

	const userMovie = userWatchlist?.[movie.tmdbId];
	const isMovieInWatchlist = !!userMovie;

	return (
		<form>
			<input name="movieTMDBId" type="hidden" value={movie.tmdbId} />
			<input name="userId" type="hidden" value={session?.user.id} />
			<input name="type" type="hidden" value={movie.type} />

			{isMovieInWatchlist ? (
				<SubmitButton
					hideLoadingText
					className="w-full"
					formAction={removeAction}
					size="sm"
				>
					<EyeOff className="size-4 fill-secondary-foreground" />
				</SubmitButton>
			) : (
				<SubmitButton
					hideLoadingText
					className="w-full"
					formAction={addAction}
					size="sm"
				>
					<Eye className="size-4" />
				</SubmitButton>
			)}
		</form>
	);
}

function Rate() {
	const { movie } = useMovieCardContext();

	return (
		<RateDialog
			movieTMDBId={movie.tmdbId}
			title={movie.title}
			type={movie.type}
			year={movie.year}
		/>
	);
}

function Type() {
	const { movie } = useMovieCardContext();

	return (
		<div className="rounded-md border border-accent bg-secondary px-2 py-1 text-muted-foreground text-xs">
			<span>{movie.type === MediaTypeEnum.movie ? "Película" : "Serie"}</span>
		</div>
	);
}

MovieCard.Poster = Poster;
MovieCard.Title = Title;
MovieCard.ReleaseDate = ReleaseDate;
MovieCard.WatchlistButton = WatchlistButton;
MovieCard.Rate = Rate;
MovieCard.Score = Score;
MovieCard.WatchProviders = WatchProviders;
MovieCard.Overview = Overview;
MovieCard.MediaType = Type;
