"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import Image from "next/image";
import { useDeferredValue, useState, useTransition } from "react";
import { MovieCard, type MovieView } from "@/components/movies/movie-card";
import { MovieGrid } from "@/components/movies/movie-grid";
import SignInButton from "@/components/sign-in-button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import dayjs from "@/lib/days";
import useDebounce from "@/media/hooks/use-debounce";
import { useSearchMovies } from "@/media/hooks/use-search-media";
import { getUserFeedQueryOptions } from "@/users/hooks/use-user-feed";
import type { FeedItem } from "@/users/user.types";

export default function HomePage() {
	const [query, setQuery] = useState("");
	const [_, startTransition] = useTransition();
	const deferredQuery = useDeferredValue(query);
	const debouncedSearchTerm = useDebounce(deferredQuery, 500);

	const handleSearch = (value: string) => {
		startTransition(() => {
			setQuery(value);
		});
	};

	const hasQuery = !!query;

	return (
		<div className="min-h-svh flex-1 py-6 md:min-h-auto">
			<div className="px-2 pb-2 md:px-10 md:pb-6">
				<SearchInput onChange={handleSearch} />
			</div>

			{hasQuery ? (
				<div className="px-4 py-2 md:px-10">
					<MoviesList debouncedSearchTerm={debouncedSearchTerm} />
				</div>
			) : (
				<>
					<SessionMessage />
					<Feed />
				</>
			)}
		</div>
	);
}

function SearchInput({ onChange }: { onChange: (values: string) => void }) {
	return (
		<div className="relative">
			<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
			<Input
				className="w-full bg-white px-10"
				onChange={(e) => onChange(e.target.value)}
				placeholder="Buscar película..."
				type="search"
			/>
		</div>
	);
}

function SessionMessage() {
	const { data: session, isPending } = authClient.useSession();

	if (!(session || isPending)) {
		return (
			<div className="flex justify-center px-4 pt-10">
				<div className="space-y-2 text-balance text-center">
					<p>Inicia sesión para calificar películas y seguir a tus amigos!</p>
					<SignInButton />
				</div>
			</div>
		);
	}

	return null;
}

function Feed() {
	const { data: session } = authClient.useSession();

	const {
		data,
		isPending,
		isFetchingNextPage,
		fetchNextPage,
		hasNextPage,
		isEnabled,
	} = useInfiniteQuery({ ...getUserFeedQueryOptions, enabled: !!session });

	if (isPending && isEnabled) {
		return (
			<div className="grid gap-4 px-2 pt-4 md:px-10">
				{[...Array(5)].map((_, idx) => (
					// biome-ignore lint:reason
					<Skeleton className="w-full h-[200px] rounded-sm" key={idx} />
				))}
			</div>
		);
	}

	const flatItems = data?.pages.flatMap((page) => page.items);

	return (
		<div>
			<div className="divide-y divide-accent-foreground">
				{flatItems &&
					flatItems.length > 0 &&
					flatItems.map((item) => (
						<div className="px-2 md:px-10" key={item.feedItemId}>
							<FeedItemCard item={item} />
						</div>
					))}
			</div>

			{hasNextPage && (
				<button
					disabled={isFetchingNextPage}
					onClick={() => fetchNextPage()}
					type="button"
				>
					{isFetchingNextPage ? "Cargando más..." : "Cargar más"}
				</button>
			)}
		</div>
	);
}

function FeedItemCard({ item }: { item: FeedItem }) {
	const movieView: MovieView = {
		tmdbId: item.movieTmdbId,
		posterPath: item.moviePoster,
		score: item.score,
		title: item.movieTitle,
		year: item.movieYear,
		overview: item.movieOverview,
		type: item.movieType,
	};

	return (
		<article className="px-2 py-4" key={item.feedItemId}>
			<div className="flex items-start gap-2 md:gap-4">
				<div className="size-[30px] rounded-full bg-accent-foreground md:size-[50px]">
					<Image
						alt={item.actorName}
						className="h-auto rounded-full object-cover"
						height={50}
						src={item.actorImage}
						unoptimized
						width={50}
					/>
				</div>

				<MovieCard
					className="flex-1 border-none bg-transparent"
					movie={movieView}
				>
					<div>
						{item.actorName}{" "}
						<span className="text-secondary-foreground/30 text-sm">
							calificó hace
						</span>{" "}
						<span className="text-secondary-foreground/30 text-sm">
							{formatFeedItemTime(item.ratedAt)}
						</span>
					</div>

					<div className="flex gap-4 md:pt-4">
						<MovieCard.Poster size="small" />
						<div className="space-y-2">
							<MovieCard.Title />
							<div className="flex flex-col gap-2 md:flex-row md:gap-4">
								<div className="space-y-2">
									<MovieCard.ReleaseDate />
									<MovieCard.Score />
								</div>
								<div>
									<MovieCard.Overview />
									<MovieCard.WatchProviders />
								</div>
							</div>
						</div>
					</div>
				</MovieCard>
			</div>
		</article>
	);
}

function MoviesList({ debouncedSearchTerm }: { debouncedSearchTerm: string }) {
	const {
		data: movies,
		isLoading,
		error,
	} = useSearchMovies(debouncedSearchTerm);

	if (isLoading) {
		return (
			<MovieGrid>
				{[...Array(10)].map((_, i) => (
					// biome-ignore lint: reason
					<div key={i}>
						<Skeleton className="h-[240px] w-[150px] rounded-xs md:h-[300px] md:w-[200px]" />
						<div className="grid gap-1 pt-2">
							<Skeleton className="h-5 w-[120px]" />
							<Skeleton className="h-5 w-[70px]" />
						</div>
					</div>
				))}
			</MovieGrid>
		);
	}

	if (error) {
		return <p>Error {JSON.stringify(error)}</p>;
	}

	return (
		<MovieGrid>
			{movies?.map((movie) => (
				<MovieCard key={movie.tmdbId} movie={movie}>
					<MovieCard.Poster />
					<CardContent className="flex flex-col gap-1 px-4 pt-2">
						<MovieCard.Title />
						<div className="flex items-center justify-between">
							<MovieCard.ReleaseDate />
							<MovieCard.MediaType />
						</div>
					</CardContent>
					<CardFooter className="flex justify-end gap-2 px-4 pb-4">
						<div className="flex-1 md:flex-initial">
							<MovieCard.WatchlistButton />
						</div>
						<div className="flex-1 md:flex-initial">
							<MovieCard.Rate />
						</div>
					</CardFooter>
				</MovieCard>
			))}
		</MovieGrid>
	);
}

function formatFeedItemTime(utcTimestamp: dayjs.ConfigType): string {
	const local = dayjs.utc(utcTimestamp).local();

	const now = dayjs();

	const diffMinutes = now.diff(local, "minute");
	const diffHours = now.diff(local, "hour");
	const diffDays = now.diff(local, "day");

	/* Today */
	if (local.isToday()) {
		if (diffMinutes < 60) {
			return `${diffMinutes}m`;
		}
		return `${diffHours}h`;
	}

	/* Yesterday */
	if (local.isYesterday()) {
		return "1d";
	}

	/* This week (2-6 days ago) */
	if (diffDays < 7) {
		return `${diffDays}d`;
	}

	/* Older than a week */
	return local.format("YYYY/MM/DD");
}
