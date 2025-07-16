"use client";

import clsx from "clsx";
import { Eye } from "lucide-react";
import Image from "next/image";
import { createContext, useContext } from "react";
import { cn } from "@/lib/utils";
import { useMovieWatchProviders } from "@/movies/hooks/use-movie-watch-providers";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { RateDialog } from "./rate-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

export interface MovieView {
  id: number; //  TMDB‐ID
  title: string;
  year: string;
  posterPath: string;
  score?: number;
  overview: string;
}

type MovieCardContextType = {
  movie: MovieView;
};

const MovieCardContext = createContext<MovieCardContextType | undefined>(
  undefined
);

function useMovieCardContext() {
  const context = useContext(MovieCardContext);
  if (!context) {
    throw new Error(
      "useMovieCardContext must be used within a MovieCard.Provider"
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
        "line-clamp-2 font-semibold leading-tight md:text-lg",
        className
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
    <Accordion type="single" collapsible>
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
  } = useMovieWatchProviders(movie.id);

  if (error) {
    return (
      <div className="text-muted-foreground text-xs">
        Error, vas a tener que googlear
      </div>
    );
  }

  return (
    <div className="md:space-y-2">
      <Button className="h-auto p-0" onClick={() => refetch()} variant="link">
        Donde ver?
      </Button>

      {isLoading && (
        <div className="flex flex-wrap gap-1 pt-2">
          {[...Array(3)].map((_, idx) => (
            // biome-ignore lint:reason
            <div key={idx}>
              <Skeleton className="size-[30px] rounded-sm" />{" "}
            </div>
          ))}
        </div>
      )}

      {watchProviders?.data && (
        <div className="flex flex-wrap gap-1">
          {watchProviders?.data.flatrate.map((provider) => (
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
          ))}
        </div>
      )}

      {/* JustWatch Attribution */}
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <span>Powered by</span>
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
  );
}

function AddToWatchlistButton() {
  return (
    <Button className="flex-1 gap-2" size="sm">
      <Eye className="size-4" />
    </Button>
  );
}

function Rate() {
  const { movie } = useMovieCardContext();

  return (
    <RateDialog movieTMDBId={movie.id} title={movie.title} year={movie.year} />
  );
}

MovieCard.Poster = Poster;
MovieCard.Title = Title;
MovieCard.ReleaseDate = ReleaseDate;
MovieCard.AddToWatchlistButton = AddToWatchlistButton;
MovieCard.Rate = Rate;
MovieCard.Score = Score;
MovieCard.WatchProviders = WatchProviders;
MovieCard.Overview = Overview;
