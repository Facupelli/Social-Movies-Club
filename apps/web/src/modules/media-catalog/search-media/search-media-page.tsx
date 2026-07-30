'use client';

import { Search, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useDeferredValue, useEffect, useState } from 'react';
import { MediaKindDict } from '@/modules/media-catalog/media.type';
import { getMediaIdentityKey } from '@/modules/media-catalog/media-identity';
import type { MovieView } from '@/modules/media-catalog/movie-view';
import { RateDialog } from '@/modules/ratings/rate-media/rate-dialog';
import { useSearchTrustedRatingSummaries } from '@/modules/trusted-rating-context/get-search-trusted-rating-summaries/use-search-trusted-rating-summaries';
import type { TrustedRatingSummary } from '@/modules/trusted-rating-context/trusted-rating-context.types';
import { AddToWatchlistButton } from '@/modules/watchlist/add-to-watchlist/add-to-watchlist-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';
import useDebounce from './use-debounce';
import { useSearchMedia } from './use-search-media';

export function SearchMediaPage({
  initialQuery = '',
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
  const searchTerm = debouncedQuery.length >= 3 ? debouncedQuery : '';

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
  }, [searchParams]);

  const updateQuery = (value: string) => {
    setQuery(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('q', value);
    } else {
      params.delete('q');
    }
    const next = params.toString();
    window.history.replaceState(
      window.history.state,
      '',
      next ? `${pathname}?${next}` : pathname
    );
  };

  return (
    <main className="mx-auto min-w-0 max-w-3xl flex-1 px-4 py-6 md:px-8 md:py-8">
      <header className="mb-3 md:mb-4">
        <h1 className="text-xl font-bold">Buscar títulos</h1>
        <div className="relative mt-2">
          <Search
            aria-hidden="true"
            className="-translate-y-1/2 absolute top-1/2 left-4 size-5 text-muted-foreground"
          />
          <Input
            aria-label="Buscar película o serie"
            autoFocus
            className="min-h-12 w-full rounded-md pr-12 pl-12 text-base [&::-webkit-search-cancel-button]:appearance-none"
            name="q"
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="Película o serie"
            type="search"
            value={query}
          />
          {query ? (
            <Button
              aria-label="Limpiar búsqueda"
              className="-translate-y-1/2 absolute top-1/2 right-1 size-10 text-muted-foreground hover:text-foreground"
              onClick={() => updateQuery('')}
              size="icon"
              type="button"
              variant="ghost"
            >
              <X className="size-4" />
            </Button>
          ) : null}
        </div>
      </header>

      {searchTerm ? (
        <SearchResults query={searchTerm} viewerUserId={viewerUserId} />
      ) : (
        <div className="border-border border-t py-8 text-sm text-muted-foreground">
          Escribí al menos 3 caracteres para empezar a buscar.
        </div>
      )}
    </main>
  );
}

function SearchResults({
  query,
  viewerUserId,
}: {
  query: string;
  viewerUserId?: string;
}) {
  const { data: movies = [], isLoading, error } = useSearchMedia(query);
  const trustedRatings = useSearchTrustedRatingSummaries(viewerUserId, movies);

  if (isLoading) {
    return <SearchResultsSkeleton />;
  }
  if (error) {
    return (
      <p className="border-border border-t py-8 text-sm text-muted-foreground">
        No pudimos completar la búsqueda. Intentá nuevamente.
      </p>
    );
  }
  if (movies.length === 0) {
    return (
      <p className="border-border border-t py-8 text-sm text-muted-foreground">
        No encontramos películas o series para “{query}”.
      </p>
    );
  }

  return (
    <section aria-label="Resultados de búsqueda">
      <p className="mb-3 md:mb-4 text-xs text-muted-foreground">
        {movies.length} {movies.length === 1 ? 'resultado' : 'resultados'} para
        “{query}”
      </p>
      <div className="space-y-3">
        {movies.map((movie) => (
          <SearchMovieCard
            isTrustedRatingLoading={
              Boolean(viewerUserId) && trustedRatings.isPending
            }
            key={getMediaIdentityKey(movie.tmdbId, movie.kind)}
            movie={movie}
            trustedRating={
              trustedRatings.data?.[
                getMediaIdentityKey(movie.tmdbId, movie.kind)
              ]
            }
          />
        ))}
      </div>
    </section>
  );
}

function SearchMovieCard({
  isTrustedRatingLoading,
  movie,
  trustedRating,
}: {
  isTrustedRatingLoading: boolean;
  movie: MovieView;
  trustedRating?: TrustedRatingSummary;
}) {
  const href = `/media/${movie.kind}/${movie.tmdbId}`;

  return (
    <article className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 overflow-hidden rounded-md border border-border bg-card p-1.5 sm:grid-cols-[128px_minmax(0,1fr)] sm:gap-4 sm:p-3">
      <Link
        className="relative aspect-[2/3] overflow-hidden rounded-sm bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        href={href}
      >
        {movie.posterPath ? (
          <Image
            alt={movie.title}
            className="object-cover"
            fill
            sizes="(max-width: 640px) 96px, 128px"
            src={`https://image.tmdb.org/t/p/w342${movie.posterPath}`}
            unoptimized
          />
        ) : (
          <span className="grid size-full place-items-center px-2 text-center text-muted-foreground text-xs">
            Sin póster
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-col">
        <Link
          className="w-fit rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href={href}
        >
          <h2 className="line-clamp-2 font-semibold text-base leading-tight sm:text-xl">
            {movie.title}
          </h2>
        </Link>

        <p className="mt-1 text-muted-foreground text-xs sm:text-sm">
          {movie.year} <span aria-hidden="true">·</span>{' '}
          {MediaKindDict[movie.kind]}
          {movie.runtime ? (
            <>
              {' '}
              <span aria-hidden="true">·</span> {formatRuntime(movie.runtime)}
            </>
          ) : null}
        </p>

        {movie.overview ? (
          <p className="mt-2 hidden line-clamp-2 text-subtle-foreground text-xs leading-snug sm:block sm:text-sm">
            {movie.overview}
          </p>
        ) : null}

        <div className="mt-auto flex gap-2 pt-2 sm:pt-3">
          <AddToWatchlistButton
            className="size-10 px-0"
            kind={movie.kind}
            tmdbId={movie.tmdbId}
            variant="outline"
          />
          <div className="w-10">
            <RateDialog
              kind={movie.kind}
              posterPath={movie.posterPath}
              title={movie.title}
              tmdbId={movie.tmdbId}
              triggerClassName="size-10 px-0"
              year={movie.year}
            />
          </div>
        </div>

        <SearchTrustedRating
          isLoading={isTrustedRatingLoading}
          summary={trustedRating}
        />
      </div>
    </article>
  );
}

function SearchTrustedRating({
  isLoading,
  summary,
}: {
  isLoading: boolean;
  summary?: TrustedRatingSummary;
}) {
  if (isLoading) {
    return (
      <div className="mt-auto border-border border-t pt-3">
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (!summary || summary.ratingCount === 0 || summary.averageScore === null) {
    return null;
  }

  return (
    <div className="mt-2 flex items-center gap-2 border-border border-t pt-2 sm:mt-3 sm:gap-3 sm:pt-3">
      <div aria-hidden="true" className="flex shrink-0 -space-x-2">
        {summary.previewRaters.map((rater) => (
          <Avatar className="size-7 border-2 border-card sm:size-8" key={rater.userId}>
            {rater.avatarUrl ? <AvatarImage alt="" src={rater.avatarUrl} /> : null}
            <AvatarFallback className="text-[10px]">
              {rater.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <p className="min-w-0 flex-1 text-muted-foreground text-xs leading-snug">
        {summary.ratingCount === 1
          ? '1 persona seguida'
          : `${summary.ratingCount} personas seguidas`}
      </p>
      <div className="shrink-0 text-right">
        <p className="font-bold text-lg text-primary tabular-nums leading-none sm:text-xl">
          {summary.averageScore.toFixed(1)}
        </p>
        <p className="text-[10px] text-subtle-foreground sm:text-xs">
          Promedio
        </p>
      </div>
    </div>
  );
}

function formatRuntime(runtime: number) {
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  return `${hours} h ${minutes} min`;
}

const SEARCH_SKELETON_KEYS = ['one', 'two', 'three', 'four'] as const;

function SearchResultsSkeleton() {
  return (
    <output className="block space-y-3">
      <Skeleton className="mb-4 h-5 w-48" />
      {SEARCH_SKELETON_KEYS.map((key) => (
        <div
          className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 rounded-md border border-border p-2 sm:grid-cols-[128px_minmax(0,1fr)] sm:gap-4 sm:p-3"
          key={key}
        >
          <Skeleton className="aspect-[2/3] w-full rounded-sm" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <div className="mt-auto flex gap-2 border-border border-t pt-3">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 w-10" />
            </div>
          </div>
        </div>
      ))}
      <span className="sr-only">Cargando resultados</span>
    </output>
  );
}
