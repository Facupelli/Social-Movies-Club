"use client";

import { useState } from "react";
import { MovieCard } from "@/components/movies/movie-card";
import { MovieGrid } from "@/components/movies/movie-grid";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import useDebounce from "@/movies/hooks/use-debounce";
import { useSearchMovies } from "@/movies/hooks/use-search-movies";
import { getUserFeedQueryOptions } from "@/users/hooks/use-user-feed";
import Image from "next/image";
import { FeedItem } from "@/users/user.pg.repository";
import dayjs from "@/lib/days";
import { useInfiniteQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const debouncedSearchTerm = useDebounce(query, 500);

  return (
    <div className="min-h-svh flex-1 py-6 md:min-h-auto ">
      <div className="pb-6 px-4 md:px-10">
        <Input
          className="w-full bg-white"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar película..."
          type="search"
        />
      </div>

      {query ? (
        <MoviesList debouncedSearchTerm={debouncedSearchTerm} />
      ) : (
        <Feed />
      )}
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
      <div className="grid gap-4 px-4 md:px-10">
        {[...Array(5)].map((_, idx) => (
          // biome-ignore lint:reason
          <Skeleton key={idx} className="w-full h-[200px] rounded-sm" />
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
            <div key={item.feedItemId} className="px-4 md:px-10">
              <FeedItemCard item={item} />
            </div>
          ))}
      </div>

      {hasNextPage && (
        <button
          type="button"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? "Cargando más..." : "Cargar más"}
        </button>
      )}
    </div>
  );
}

function FeedItemCard({ item }: { item: FeedItem }) {
  return (
    <article key={item.feedItemId} className="px-2 py-4">
      <div className="flex items-start gap-4">
        <div className="size-[50px] bg-accent-foreground rounded-full">
          <Image
            alt={item.actorName}
            unoptimized
            src={item.actorImage}
            width={50}
            height={50}
            className="h-auto object-cover rounded-full"
          />
        </div>

        <div>
          <div>
            {item.actorName}{" "}
            <span className="text-secondary-foreground/30 text-sm">
              calificó
            </span>
            <span className="pl-4 text-secondary-foreground/30 text-sm">
              {formatFeedItemTime(item.ratedAt)}
            </span>
          </div>
          <div className="pt-4 flex gap-4">
            <div>
              <Image
                alt={item.movieTitle}
                unoptimized
                src={`https://image.tmdb.org/t/p/original${item.moviePoster}`}
                width={100}
                height={200}
                className="h-auto object-cover rounded-xs"
              />
            </div>
            <div>
              <div>
                <span className="font-bold">{item.movieTitle}</span>
              </div>
              <div>
                <span className="text-sm text-secondary-foreground/30">
                  {item.movieYear}
                </span>
              </div>
              <div className="size-7 rounded-xs bg-primary flex justify-center items-center">
                <span className="text-lg font-bold">{item.score}</span>
              </div>
            </div>
          </div>
        </div>
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
        <MovieCard key={movie.id} movie={movie}>
          <MovieCard.Poster />
          <CardContent className="flex flex-col gap-1 px-4 pt-2">
            <MovieCard.Title />
            <MovieCard.ReleaseDate />
          </CardContent>
          <CardFooter className="gap-2 px-4 pb-4">
            <MovieCard.AddToWatchlistButton />
            <MovieCard.Rate />
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
    if (diffMinutes < 60) return `${diffMinutes}m`;
    return `${diffHours}h`;
  }

  /* This week (1–6 days ago) */
  if (diffDays < 7) {
    return `${diffDays}d`;
  }

  /* Older than a week */
  return local.format("YYYY/MM/DD");
}
