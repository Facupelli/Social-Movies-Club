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
import { MovieCard, type MovieView } from "@/components/movies/movie-card";
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
import type { SortBy, SortOrder } from "./page";

export function ProfileMoviesClientPage({
  profileMovies = [],
  searchParams,
}: {
  profileMovies: MovieView[];
  searchParams: { sortBy?: SortBy; sortOrder?: SortOrder };
}) {
  const router = useRouter();
  const pathname = usePathname();

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleSortOrder = () => {
    const newOrder = searchParams.sortOrder === "asc" ? "desc" : "asc";
    updateSearchParams("sortOrder", newOrder);
  };

  const handleSortByChange = (value: string) => {
    updateSearchParams("sortBy", value);
  };

  const getSortLabel = () => {
    return searchParams.sortBy === "score" ? "Puntaje" : "Fecha";
  };

  return (
    <Tabs className="flex-1 pt-2 pb-10" defaultValue="grid">
      <div className="flex justify-between gap-4 py-4 md:justify-end">
        <div className="flex h-9 items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="h-[calc(100%-1px)] gap-2 bg-transparent"
                variant="outline"
              >
                {searchParams.sortBy === "score" ? (
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
                value={searchParams.sortBy}
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
            title={`Sort ${searchParams.sortOrder === "asc" ? "ascending" : "descending"}`}
            variant="outline"
          >
            {searchParams.sortOrder === "asc" ? (
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
          {profileMovies.map((movie) => (
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
      </TabsContent>

      <TabsContent value="list">
        <MovieList>
          {profileMovies.map((movie, idx) => (
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
        </MovieList>
      </TabsContent>
    </Tabs>
  );
}
