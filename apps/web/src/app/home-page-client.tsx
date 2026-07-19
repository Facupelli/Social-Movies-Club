"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
	Calendar,
	ChevronDown,
	Clapperboard,
	Search,
	Star,
	UserPlus,
	Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useState } from "react";
import {
	MovieCard,
	MovieMediaType,
	MoviePoster,
	MovieReleaseDate,
	MovieScore,
	MovieTitle,
} from "@/components/movies/movie-card";
import { MovieGrid } from "@/components/movies/movie-grid";
import { MovieWatchProviders } from "@/components/movies/movie-watch-providers";
import { RateDialog } from "@/components/movies/rate-dialog";
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
import { useIsMobile } from "@/lib/hooks/use-mobile";
import { formatFeedItemTime } from "@/lib/utils";
import useDebounce from "@/media/hooks/use-debounce";
import { useSearchMedia } from "@/media/hooks/use-search-media";
import { TYPE_DICT } from "@/media/media.constants";
import type { AggregatedFeedItem } from "@/users/feed.types";
import { getUserAggregatedFeedQueryOptions } from "@/users/hooks/use-user-aggregated-feed";
import { getUserFeedQueryOptions } from "@/users/hooks/use-user-feed";
import type { FeedItem } from "@/users/user.types";
import { AddToWatchlistButton } from "@/watchlist/components/add-to-watchlist-button";

export function HomePageClient({
	initialQuery = "",
	viewerUserId,
}: {
	initialQuery?: string;
	viewerUserId?: string;
}) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [query, setQuery] = useState(initialQuery);
	const deferredQuery = useDeferredValue(query.trim());
	const debouncedQuery = useDebounce(deferredQuery, 500);
	const debouncedSearchTerm =
		debouncedQuery.length >= 3 ? debouncedQuery : "";

	useEffect(() => {
		setQuery(searchParams.get("q") ?? "");
	}, [searchParams]);

	const handleSearch = (value: string) => {
		setQuery(value);

		const params = new URLSearchParams(searchParams.toString());
		if (value) {
			params.set("q", value);
		} else {
			params.delete("q");
		}

		const queryString = params.toString();
		const url = queryString ? `${pathname}?${queryString}` : pathname;
		window.history.replaceState(window.history.state, "", url);
	};

	return (
		<div className="relative min-h-svh flex-1 py-6 md:min-h-auto">
			<div className="relative z-20 px-2 pb-2 md:px-10 md:pb-6">
				<SearchInput onChange={handleSearch} value={query} />
			</div>

			<HomeContent
				debouncedSearchTerm={debouncedSearchTerm}
				viewerUserId={viewerUserId}
			/>
		</div>
	);
}

function HomeContent({
	debouncedSearchTerm,
	viewerUserId,
}: {
	debouncedSearchTerm: string;
	viewerUserId?: string;
}) {
	const hasQuery = !!debouncedSearchTerm;

	if (hasQuery) {
		return <MoviesList debouncedSearchTerm={debouncedSearchTerm} />;
	}

	return (
		<>
			<SessionMessage isAuthenticated={Boolean(viewerUserId)} />
			{/* <AggregatedFeed /> */}
			<Feed viewerUserId={viewerUserId} />
		</>
	);
}

function SearchInput({
	onChange,
	value,
}: {
	onChange: (values: string) => void;
	value: string;
}) {
	return (
		<div className="relative">
			<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-primary" />
			<Input
				className="w-full bg-white px-10"
				onChange={(e) => onChange(e.target.value)}
				placeholder="Buscar película o serie"
				type="search"
				value={value}
			/>
		</div>
	);
}

function SessionMessage({ isAuthenticated }: { isAuthenticated: boolean }) {
	if (!isAuthenticated) {
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

function _AggregatedFeed({ viewerUserId }: { viewerUserId?: string }) {
	const {
		data,
		isPending,
		isFetchingNextPage,
		fetchNextPage,
		hasNextPage,
		isEnabled,
	} = useInfiniteQuery({
		...getUserAggregatedFeedQueryOptions(viewerUserId),
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
	const lastRating = item.ratings?.at(0);

	if (!lastRating) {
		return null;
	}

	const otherRatings = item.ratings?.slice(1);
	const hasMoreRatings = otherRatings && otherRatings.length > 0;

	return (
		<MovieCard className="w-full py-4 px-2 md:px-0 overflow-hidden shadow-none border-none bg-transparent">
			<div className="flex flex-col md:flex-row gap-2 md:gap-6">
				<div className="md:block hidden">
					<Link
						href={`/profile/${lastRating.user.id}`}
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
								<MovieTitle className="md:text-xl" title={item.media.title} />
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
							<MovieWatchProviders
								tmdbId={item.media.tmdbId}
								type={item.media.type}
							/>
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

							<MovieScore score={lastRating.score} />
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

function Feed({ viewerUserId }: { viewerUserId?: string }) {
	const { data, isPending, isFetchingNextPage, fetchNextPage, hasNextPage } =
		useInfiniteQuery(getUserFeedQueryOptions(viewerUserId));

	if (!viewerUserId) {
		return null;
	}

	if (isPending) {
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

	if (!flatItems || flatItems.length <= 0) {
		return (
			<div>
				<div className="absolute inset-0 bg-radial from-primary to-background z-0 opacity-10" />

				<div className="relative z-20 flex flex-col items-center gap-y-2 py-10">
					<div>
						<Clapperboard className="text-primary size-12" />
					</div>
					<p className="text-xl font-bold text-center">
						Tu feed está un poco vacío
					</p>
					<p className="text-muted-foreground text-sm text-center">
						Sigue a tus amigos para ver sus críticas o empieza a puntuar
						películas para recibir recomendaciones
					</p>
					<div className="pt-4">
						<Button className="font-semibold" asChild>
							<Link href="/users">
								<UserPlus className="size-5" />
								Encuentra a tus amigos
							</Link>
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div>
			<div className="divide-y divide-accent-foreground">
				{flatItems.map((item) => (
					<div className="px-2 md:px-10" key={item.feedItemId}>
						<FeedItemCard item={item} />
					</div>
				))}
			</div>

			{hasNextPage && (
				<div className="flex justify-center py-4">
					<Button
						disabled={isFetchingNextPage}
						onClick={() => fetchNextPage()}
						type="button"
					>
						{isFetchingNextPage ? "Cargando más..." : "Cargar más"}
					</Button>
				</div>
			)}
		</div>
	);
}

function FeedItemCard({ item }: { item: FeedItem }) {
	const isMobile = useIsMobile();

	return (
		<MovieCard className="w-full py-4 px-2 md:px-0 overflow-hidden shadow-none border-none bg-transparent">
			<div className="flex flex-col md:flex-row gap-2 md:gap-6">
				<div className="md:block hidden">
					<Link
						href={`/profile/${item.actorId}`}
						className="size-[30px] rounded-full bg-accent-foreground md:size-[50px]"
					>
						<Avatar className="size-7 md:size-10">
							<AvatarImage
								src={item.actorImage || "/placeholder.svg"}
								alt={item.actorName}
							/>
							<AvatarFallback>
								{item.actorName.charAt(0).toUpperCase()}
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
										? `https://image.tmdb.org/t/p/w500${item.movieBackdrop}`
										: `https://image.tmdb.org/t/p/original${item.moviePoster}`) ||
									"/placeholder.svg?height=288&width=192"
								}
								alt={item.movieTitle}
								width={192}
								height={288}
								className="rounded-xs object-cover w-full h-auto max-h-[250px] md:max-h-[300px]"
							/>

							<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xs" />

							<Badge
								variant="secondary"
								className="absolute top-2 right-2 text-xs font-medium bg-black/60 text-white border-0"
							>
								{TYPE_DICT[item.movieType]}
							</Badge>
							<div className="absolute bottom-3 left-3 right-3 text-white">
								<p className="text-xs font-medium opacity-90">
									{item.movieYear}
								</p>
							</div>

							<div className="absolute right-2 bottom-2">
								<AddToWatchlistButton
									tmdbId={item.movieTmdbId}
									type={item.movieType}
									variant="secondary"
									className="bg-secondary/50"
								/>
							</div>
						</div>
					</div>
				</div>

				<div className="flex-1  flex flex-col">
					<div className="grid ">
						<div className="flex items-baseline">
							<div className="flex-1">
								<MovieTitle className="md:text-xl" title={item.movieTitle} />
							</div>
							<div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
								<span>hace</span>
								{formatFeedItemTime(item.ratedAt)}
							</div>
						</div>

						<div className="flex-1 pt-2">
							<Accordion collapsible type="single">
								<AccordionItem value="item-1">
									<AccordionTrigger className="py-0 pb-2">
										Sinopsis
									</AccordionTrigger>
									<AccordionContent>{item.movieOverview}</AccordionContent>
								</AccordionItem>
							</Accordion>
							<MovieWatchProviders tmdbId={item.movieTmdbId} type={item.movieType} />
						</div>
					</div>

					<div className="mt-auto pt-4 md:pt-2">
						<div className="flex items-center gap-2 md:gap-4 p-3 bg-muted/50 rounded-sm">
							<Link
								href={`/profile/${item.actorId}`}
								className="size-[30px] rounded-full bg-accent-foreground md:size-[50px] md:hidden"
							>
								<Avatar className="size-7 md:size-10">
									<AvatarImage
										src={item.actorImage || "/placeholder.svg"}
										alt={item.actorName}
									/>
									<AvatarFallback>
										{item.actorName.charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
							</Link>

							<div className="flex-1 flex md:justify-between gap-3 md:gap-0 items-center pr-2">
								<div className="grid md:gap-1">
									<div className="flex lead items-center gap-2">
										<span className="font-semibold text-sm">
											{item.actorName}
										</span>
									</div>
									<span className="text-xs lead text-muted-foreground">
										{item.actorUsername}
									</span>
								</div>
							</div>

							<MovieScore score={item.score} />
						</div>
					</div>
				</div>
			</div>
		</MovieCard>
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
							<Skeleton className="aspect-[2/3] w-full rounded-xs bg-muted" />
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
					<MovieCard key={movie.tmdbId}>
						<MoviePoster posterPath={movie.posterPath} title={movie.title} />
						<CardContent className="flex flex-col gap-1 px-4 pt-2">
							<MovieTitle title={movie.title} />
							<div className="flex items-center justify-between">
								<MovieReleaseDate year={movie.year} />
								<MovieMediaType type={movie.type} />
							</div>
						</CardContent>
						<CardFooter className="flex justify-end gap-2 px-4 pb-4">
							<div className="flex-1 md:flex-initial">
								<AddToWatchlistButton tmdbId={movie.tmdbId} type={movie.type} />
							</div>
							<div className="flex-1 md:flex-initial">
								<RateDialog
									tmdbId={movie.tmdbId}
									title={movie.title}
									type={movie.type}
									year={movie.year}
								/>
							</div>
						</CardFooter>
					</MovieCard>
				))}
			</MovieGrid>
		</div>
	);
}
