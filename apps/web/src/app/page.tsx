"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Calendar, ChevronDown, Search, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useDeferredValue, useState, useTransition } from "react";
import { MovieCard, type MovieView } from "@/components/movies/movie-card";
import { MovieGrid } from "@/components/movies/movie-grid";
import SignInButton from "@/components/sign-in-button";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth/auth-client";
import dayjs from "@/lib/days";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import useDebounce from "@/media/hooks/use-debounce";
import { useSearchMedia } from "@/media/hooks/use-search-media";
import { useSearchUsers } from "@/media/hooks/use-serach-users";
import { TYPE_DICT } from "@/media/media.constants";
import { WelcomeDialog } from "@/users/components/welcome-dialog";
import type { AggregatedFeedItem } from "@/users/feed.types";
import { getUserAggregatedFeedQueryOptions } from "@/users/hooks/use-user-aggregated-feed";
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

	return (
		<>
			<Suspense>
				<WelcomeDialog />
			</Suspense>

			<div className="min-h-svh flex-1 py-6 md:min-h-auto">
				<div className="px-2 pb-2 md:px-10 md:pb-6">
					<SearchInput onChange={handleSearch} />
				</div>

				<RenderProperSection debouncedSearchTerm={debouncedSearchTerm} />
			</div>
		</>
	);
}

function RenderProperSection({
	debouncedSearchTerm,
}: {
	debouncedSearchTerm: string;
}) {
	const hasQuery = !!debouncedSearchTerm;
	const isUserQuery = debouncedSearchTerm.startsWith("@");

	if (isUserQuery) {
		return <UsersList debouncedSearchTerm={debouncedSearchTerm} />;
	}

	if (hasQuery) {
		return <MoviesList debouncedSearchTerm={debouncedSearchTerm} />;
	}

	return (
		<>
			<SessionMessage />
			<AggregatedFeed />
			{/* <Feed /> */}
		</>
	);
}

function SearchInput({ onChange }: { onChange: (values: string) => void }) {
	return (
		<div className="relative">
			<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
			<Input
				className="w-full bg-white px-10"
				onChange={(e) => onChange(e.target.value)}
				placeholder="Buscar película, serie o @usuario"
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

function AggregatedFeed() {
	const { data: session } = authClient.useSession();

	const {
		data,
		isPending,
		isFetchingNextPage,
		fetchNextPage,
		hasNextPage,
		isEnabled,
	} = useInfiniteQuery({
		...getUserAggregatedFeedQueryOptions,
		enabled: !!session,
	});

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
						<div className="px-2 md:px-10" key={item.bucketId}>
							<AggregatedFeedItemCard item={item} />
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

function AggregatedFeedItemCard({ item }: { item: AggregatedFeedItem }) {
	const isMobile = useIsMobile();
	console.log("AGGRGEATTED ITEM", { item });
	const lastRating = item.ratings?.at(0);

	if (!lastRating) {
		return null;
	}

	const otherRatings = item.ratings?.slice(1);
	const hasMoreRatings = otherRatings && otherRatings.length > 0;

	const movieView: MovieView = {
		tmdbId: item.media.tmdbId,
		posterPath: item.media.posterPath,
		backdropPath: item.media.backdropPath,
		score: lastRating.score,
		title: item.media.title,
		year: item.media.year,
		overview: item.media.overview,
		type: item.media.type,
	};

	return (
		<MovieCard
			movie={movieView}
			className="w-full py-4 px-2 md:px-0 overflow-hidden shadow-none border-none bg-transparent"
		>
			<div className="flex flex-col md:flex-row gap-2 md:gap-6">
				<div className="md:block hidden">
					<Link
						href={`/profile/${lastRating.user.id}`}
						prefetch={false}
						className="size-[30px] rounded-full bg-accent-foreground md:size-[50px]"
					>
						<Avatar className="size-7 md:size-10">
							<AvatarImage
								src={lastRating.user.image || "/placeholder.svg"}
								alt={lastRating.user.name}
							/>
							<AvatarFallback>
								{lastRating.user.name.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>
					</Link>
				</div>

				<div className="relative flex-shrink-0 w-full md:w-44">
					<div className="sticky top-0">
						<div className="relative">
							<Image
								unoptimized
								src={
									(isMobile
										? `https://image.tmdb.org/t/p/w500${item.media.backdropPath}`
										: `https://image.tmdb.org/t/p/original${item.media.posterPath}`) ||
									"/placeholder.svg?height=288&width=192"
								}
								alt={item.media.title}
								width={192}
								height={288}
								className="rounded-xs object-cover w-full h-auto max-h-[250px] md:max-h-[300px]"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xs" />
							<Badge
								variant="secondary"
								className="absolute top-2 right-2 text-xs font-medium bg-black/60 text-white border-0"
							>
								{TYPE_DICT[item.media.type]}
							</Badge>
							<div className="absolute bottom-3 left-3 right-3 text-white">
								<p className="text-xs font-medium opacity-90">
									{item.media.year}
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="flex-1  flex flex-col">
					<div className="grid ">
						<div className="flex items-baseline">
							<div className="flex-1">
								<MovieCard.Title className="md:text-xl" />
							</div>
							<div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
								<span>hace</span>
								{formatFeedItemTime(item.lastRatingAt)}
							</div>
						</div>

						<div className="flex-1 pt-2">
							<Accordion collapsible type="single">
								<AccordionItem value="item-1">
									<AccordionTrigger className="py-0 pb-2">
										Sinopsis
									</AccordionTrigger>
									<AccordionContent>{item.media.overview}</AccordionContent>
								</AccordionItem>
							</Accordion>
							<MovieCard.WatchProviders />
						</div>
					</div>

					<div className="mt-auto pt-4 md:pt-2">
						{/* Latest Rating */}
						<div className="flex items-center gap-2 md:gap-4 p-3 bg-muted/50 rounded-sm">
							<div className="flex-1 flex md:justify-between gap-3 md:gap-0 items-center pr-2">
								<Avatar className="size-7 md:size-10">
									<AvatarImage
										src={lastRating.user.image || "/placeholder.svg"}
										alt={lastRating.user.name}
									/>
									<AvatarFallback>
										{lastRating.user.name.charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<div>
									<div className="flex lead items-center gap-2">
										<span className="font-semibold text-sm">
											{lastRating.user.name}
										</span>
									</div>
									<span className="text-xs lead text-muted-foreground">
										{lastRating.user.username}
									</span>
								</div>
							</div>

							{/* Dropdown for Additional Ratings */}
							{hasMoreRatings && (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="sm"
											className="text-muted-foreground hover:text-foreground"
										>
											<Users className="w-4 h-4 mr-1" />+{otherRatings.length}
											<ChevronDown className="w-3 h-3 ml-1" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-80">
										<DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
											Otras calificaciones
										</DropdownMenuLabel>
										<DropdownMenuSeparator />
										{otherRatings.map((rating) => (
											<DropdownMenuItem
												key={rating.ratingId}
												className="p-3 focus:bg-muted/50"
											>
												<div className="flex items-center gap-3 w-full">
													<Avatar className="w-8 h-8">
														<AvatarImage
															src={rating.user.image || "/placeholder.svg"}
															alt={rating.user.name}
														/>
														<AvatarFallback className="text-xs">
															{rating.user.name.charAt(0).toUpperCase()}
														</AvatarFallback>
													</Avatar>

													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2 mb-1">
															<span className="font-medium text-sm truncate">
																{rating.user.name}
															</span>
															<span className="text-xs text-muted-foreground">
																{rating.user.username}
															</span>
														</div>
														<div className="flex items-center justify-between">
															<ScoreDisplay score={rating.score} />
															<span className="text-xs text-muted-foreground">
																{formatFeedItemTime(rating.createdAt)}
															</span>
														</div>
													</div>
												</div>
											</DropdownMenuItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
							)}

							<MovieCard.Score />
						</div>

						{/* Stats */}
						<div className="flex items-center justify-end gap-4 pt-2 text-xs text-muted-foreground">
							<div className="flex items-center gap-1">
								<Users className="w-3 h-3" />
								{item.ratingCount} total
							</div>
							{item.seenAt && (
								<div className="flex items-center gap-1">
									<Calendar className="w-3 h-3" />
									Seen {formatFeedItemTime(item.seenAt)}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</MovieCard>
	);
}

function ScoreDisplay({ score }: { score: number }) {
	const stars = Math.round(score / 2); // Assuming score is out of 10, convert to 5 stars

	return (
		<div className="flex items-center gap-1">
			<div className="flex">
				{[...Array(5)].map((_, i) => (
					<Star
						// biome-ignore lint:reason
						key={i}
						className={`size-3 ${i < stars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
					/>
				))}
			</div>
			<span className="text-sm font-medium text-muted-foreground ml-1">
				{score}/10
			</span>
		</div>
	);
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
		backdropPath: item.movieBackdrop,
		score: item.score,
		title: item.movieTitle,
		year: item.movieYear,
		overview: item.movieOverview,
		type: item.movieType,
	};

	return (
		<article className="px-2 py-4" key={item.feedItemId}>
			<div className="flex items-start gap-2 md:gap-4">
				<Link
					href={`/profile/${item.actorId}`}
					prefetch={false}
					className="size-[30px] rounded-full bg-accent-foreground md:size-[50px]"
				>
					<Image
						alt={item.actorName}
						className="h-auto rounded-full object-cover"
						height={50}
						src={item.actorImage}
						unoptimized
						width={50}
					/>
				</Link>

				<MovieCard
					className="flex-1 border-none bg-transparent"
					movie={movieView}
				>
					<Link href={`/profile/${item.actorId}`} prefetch={false}>
						{item.actorName}{" "}
						<span className="text-secondary-foreground/30 text-sm">
							calificó hace
						</span>{" "}
						<span className="text-secondary-foreground/30 text-sm">
							{formatFeedItemTime(item.ratedAt)}
						</span>
					</Link>

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

function UsersList({ debouncedSearchTerm }: { debouncedSearchTerm: string }) {
	const { data: users } = useSearchUsers(debouncedSearchTerm);

	return (
		<div className="px-4 md:px-10">
			{users?.map((user) => (
				<Link
					key={user.id}
					prefetch={false}
					href={`/profile/${user.id}`}
					className="flex items-center gap-4 hover:bg-muted rounded-md p-2"
				>
					{user.image && (
						<div className="shrink-0 rounded-full bg-secondary-foreground">
							<Image
								alt={user.name}
								className="size-[30px] rounded-full object-cover"
								height={30}
								src={user.image}
								unoptimized
								width={30}
							/>
						</div>
					)}

					<div className="text-sm">
						<span className="block">{user.name}</span>
						<span className="block text-muted-foreground">{user.username}</span>
					</div>
				</Link>
			))}
		</div>
	);
}

function MoviesList({ debouncedSearchTerm }: { debouncedSearchTerm: string }) {
	const {
		data: movies,
		isLoading,
		error,
	} = useSearchMedia(debouncedSearchTerm);

	if (isLoading) {
		return (
			<div className="px-2 pt-2 md:px-10">
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
			</div>
		);
	}

	if (error) {
		return <p>Error {JSON.stringify(error)}</p>;
	}

	return (
		<div className="px-2 pt-2 md:px-10">
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
		</div>
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
