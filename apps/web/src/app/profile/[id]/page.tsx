"use client";

import {
  AlignJustify,
  ArrowDown,
  ArrowUp,
  Calendar,
  Grid2X2,
  Star,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
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
import { use, useEffect, useState } from "react";
import type { UserMoviesSortBy, UserMoviesSortOrder } from "@/users/user.types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getUserMoviesQueryOptions } from "@/users/hooks/use-user-movies";
import { LOCAL_STORAGE_KEYS } from "@/lib/app.constants";

export default function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    sortBy?: UserMoviesSortBy;
    sortOrder?: UserMoviesSortOrder;
    page?: string;
  }>;
}) {
  const pageParams = use(params);
  const pageSearchParams = use(searchParams);

  const { data, isPending, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery(getUserMoviesQueryOptions(pageParams.id));
  const profileMovies = data?.pages.flatMap((page) => page.data);

  const [tab, setTab] = useState<string>("grid");

  // biome-ignore lint: only need this to run on first render
  useEffect(() => {
    const savedTab = localStorage.getItem(LOCAL_STORAGE_KEYS.PROFILE_TAB_VIEW);
    if (savedTab && savedTab !== tab) {
      setTab(savedTab);
    }
  }, []);

  const router = useRouter();
  const pathname = usePathname();

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);

    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleSortOrder = () => {
    const newOrder = pageSearchParams.sortOrder === "asc" ? "desc" : "asc";
    updateSearchParams("sortOrder", newOrder);
  };

  const handleSortByChange = (value: string) => {
    updateSearchParams("sortBy", value);
  };

  const getSortLabel = () => {
    return pageSearchParams.sortBy === "score" ? "Puntaje" : "Fecha";
  };

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
      <div className="flex justify-between gap-4 py-4 md:justify-end">
        <div className="flex h-9 items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="h-[calc(100%-1px)] gap-2 bg-transparent"
                variant="outline"
              >
                {pageSearchParams.sortBy === "score" ? (
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
                value={pageSearchParams.sortBy}
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
            title={`Sort ${pageSearchParams.sortOrder === "asc" ? "ascending" : "descending"}`}
            variant="outline"
          >
            {pageSearchParams.sortOrder === "asc" ? (
              <ArrowUp className="size-4" />
            ) : (
              <ArrowDown className="size-4" />
            )}
          </Button>
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

      <TabsContent value="grid">
        <MovieGrid>
          {isPending && <p>Cargando...</p>}

          {profileMovies?.map((movie) => (
            <MovieCard key={movie.id} movie={movie}>
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
            <MovieCard key={movie.id} movie={movie}>
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

                  <div className="self-center px-2 md:px-4">
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
