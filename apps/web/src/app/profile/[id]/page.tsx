"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
	AlignJustify,
	ArrowDown,
	ArrowUp,
	Calendar,
	Grid2X2,
	Star,
	Users,
	UserX,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";
import { MovieCard } from "@/components/movies/movie-card";
import { MovieGrid } from "@/components/movies/movie-grid";
import { MovieList } from "@/components/movies/movie-list";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LOCAL_STORAGE_KEYS } from "@/lib/app.constants";
import { useIsOwner } from "@/lib/hooks/use-is-owner";
import { cn } from "@/lib/utils";
import { TYPE_FILTER_DICT } from "@/media/media.constants";
import { getUserMoviesQueryOptions } from "@/users/hooks/use-user-movies";
import { useUserMoviesFilters } from "@/users/hooks/use-user-movies-filter";

export default function ProfilePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const pageParams = use(params);
	const { filters } = useUserMoviesFilters();

	const { data, isPending, hasNextPage, fetchNextPage, isFetchingNextPage } =
		useInfiniteQuery(
			getUserMoviesQueryOptions({
				userId: pageParams.id,
				...filters,
			}),
		);

	const profileMovies = data?.pages.flatMap((page) => page.data);

	const [tab, setTab] = useState<string>("grid");

	// biome-ignore lint: only need this to run on first render
	useEffect(() => {
		const savedTab = localStorage.getItem(LOCAL_STORAGE_KEYS.PROFILE_TAB_VIEW);
		if (savedTab && savedTab !== tab) {
			setTab(savedTab);
		}
	}, []);

	const onTabChange = (value: string) => {
		localStorage.setItem(LOCAL_STORAGE_KEYS.PROFILE_TAB_VIEW, value);
		setTab(value);
	};

	const handleFetchNextPage = () => {
		fetchNextPage();
	};

	return (
		<Tabs
			className="flex-1 pt-2 pb-10"
			defaultValue="grid"
			onValueChange={onTabChange}
			value={tab}
		>
			<RatingFilters />

			<TabsContent value="grid">
				<MovieGrid>
					{isPending && <p>Cargando...</p>}

					{profileMovies?.map((movie) => (
						<MovieCard key={movie.tmdbId} movie={movie}>
							<MovieCard.Poster />
							<CardContent className="flex flex-col gap-1 px-4 py-2">
								<MovieCard.Title />
								<div className="flex items-center justify-between">
									<MovieCard.ReleaseDate />
									<MovieCard.Score />
								</div>
							</CardContent>
						</MovieCard>
					))}
				</MovieGrid>

				{hasNextPage && (
					<LoadNextPageButton
						onFecthNextPage={handleFetchNextPage}
						isFetchingNextPage={isFetchingNextPage}
					/>
				)}
			</TabsContent>

			<TabsContent value="list">
				<MovieList>
					{isPending && <p>Cargando...</p>}

					{profileMovies?.map((movie, idx) => (
						<MovieCard key={movie.tmdbId} movie={movie}>
							<div className="flex gap-6">
								<p className="hidden pl-2 font-bold md:block">{idx + 1}</p>

								<div className="flex flex-1 gap-4">
									<MovieCard.Poster size="small" />

									<div className="flex flex-col gap-2 md:flex-1 md:flex-row md:gap-4">
										<div className="pt-2 md:flex-1">
											<MovieCard.Title className="font-bold text-lg" />
											<MovieCard.ReleaseDate />
										</div>
										<div className="flex items-center gap-4 md:pr-4">
											<MovieCard.WatchProviders />
										</div>
									</div>

									<div className="ml-auto self-center px-2 md:px-4">
										<MovieCard.Score />
									</div>
								</div>
							</div>
						</MovieCard>
					))}

					{hasNextPage && (
						<LoadNextPageButton
							onFecthNextPage={handleFetchNextPage}
							isFetchingNextPage={isFetchingNextPage}
						/>
					)}
				</MovieList>
			</TabsContent>
		</Tabs>
	);
}

function RatingFilters() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const { isOwner } = useIsOwner();
	const { filters } = useUserMoviesFilters();

	const updateSearchParams = (key: string, value: string) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set(key, value);

		router.push(`${pathname}?${params.toString()}`);
	};

	const hideSharedRatings = !!filters.bothRated;
	const toggleSharedRatings = () => {
		const newBothRated = !filters.bothRated;
		updateSearchParams("bothRated", newBothRated.toString());
	};

	const toggleSortOrder = () => {
		const newOrder = filters.sortOrder === "asc" ? "desc" : "asc";
		updateSearchParams("sortOrder", newOrder);
	};

	const handleSortByChange = (value: string) => {
		updateSearchParams("sortBy", value);
	};

	const handleFilterByChange = (value: string) => {
		updateSearchParams("type", value);
	};

	const getSortLabel = () => {
		return filters.sortBy === "score" ? "Puntaje" : "Fecha";
	};

	return (
		<div className="overflow-x-auto flex justify-between gap-4 py-4 md:justify-end">
			<div className="flex h-9 items-center gap-4">
				{!isOwner && (
					<Button
						className={cn(
							"h-[calc(100%-1px)] gap-2 bg-transparent transition-colors",
							hideSharedRatings &&
								"bg-primary/10 text-primary border-primary/20",
						)}
						onClick={toggleSharedRatings}
						title={
							hideSharedRatings ? "Ocultar compartidas" : "Mostrar compartidas"
						}
						variant="outline"
					>
						{hideSharedRatings ? (
							<Users className="size-4" />
						) : (
							<UserX className="size-4" />
						)}
						<span className="font-normal text-neutral-500">
							{hideSharedRatings ? "Mostrar" : "Ocultar"} compartidas
						</span>
					</Button>
				)}

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							className="h-[calc(100%-1px)] gap-2 bg-transparent"
							variant="outline"
						>
							{filters.typeFilter
								? TYPE_FILTER_DICT[filters.typeFilter]
								: TYPE_FILTER_DICT.all}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuRadioGroup
							onValueChange={handleFilterByChange}
							value={filters.typeFilter}
						>
							<DropdownMenuRadioItem className="gap-2" value="all">
								Todo
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem className="gap-2" value="movie">
								Películas
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem className="gap-2" value="tv">
								Series
							</DropdownMenuRadioItem>
						</DropdownMenuRadioGroup>
					</DropdownMenuContent>
				</DropdownMenu>

				<div className="flex items-center h-9 gap-1">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								className="h-[calc(100%-1px)] gap-2 bg-transparent"
								variant="outline"
							>
								{filters.sortBy === "score" ? (
									<Star className="size-4" />
								) : (
									<Calendar className="size-4" />
								)}
								<span className="font-normal text-neutral-500">
									Ordenar por
								</span>{" "}
								{getSortLabel()}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuRadioGroup
								onValueChange={handleSortByChange}
								value={filters.sortBy}
							>
								<DropdownMenuRadioItem className="gap-2" value="score">
									<Star className="size-4" />
									Puntaje
								</DropdownMenuRadioItem>
								<DropdownMenuRadioItem className="gap-2" value="createdAt">
									<Calendar className="size-4" />
									Fecha agregada
								</DropdownMenuRadioItem>
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>

					<Button
						className="h-[calc(100%-1px)] gap-1 bg-transparent"
						onClick={toggleSortOrder}
						size="icon"
						title={`Sort ${filters.sortOrder === "asc" ? "ascending" : "descending"}`}
						variant="outline"
					>
						{filters.sortOrder === "asc" ? (
							<ArrowUp className="size-4" />
						) : (
							<ArrowDown className="size-4" />
						)}
					</Button>
				</div>
			</div>

			<TabsList>
				<TabsTrigger asChild value="grid">
					<Button size="icon" variant="ghost">
						<Grid2X2 />
					</Button>
				</TabsTrigger>

				<TabsTrigger asChild value="list">
					<Button size="icon" variant="ghost">
						<AlignJustify />
					</Button>
				</TabsTrigger>
			</TabsList>
		</div>
	);
}

function LoadNextPageButton({
	onFecthNextPage,
	isFetchingNextPage,
}: {
	onFecthNextPage: () => void;
	isFetchingNextPage: boolean;
}) {
	return (
		<div className="flex justify-center">
			<Button
				type="button"
				disabled={isFetchingNextPage}
				onClick={onFecthNextPage}
			>
				{isFetchingNextPage ? "Cargando..." : "Ver más"}
			</Button>
		</div>
	);
}
