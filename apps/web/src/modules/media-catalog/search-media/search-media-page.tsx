'use client';

import { Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useDeferredValue, useEffect, useState } from 'react';
import {
  MovieCard,
  MovieMediaKind,
  MoviePoster,
  MovieReleaseDate,
  MovieTitle,
} from '@/modules/media-catalog/components/movie-card';
import { MovieGrid } from '@/modules/media-catalog/components/movie-grid';
import { getMediaIdentityKey } from '@/modules/media-catalog/media-identity';
import type { MovieView } from '@/modules/media-catalog/movie-view';
import { RateDialog } from '@/modules/ratings/rate-media/rate-dialog';
import { TrustedRatingSummaryView } from '@/modules/trusted-rating-context/components/trusted-rating-summary';
import { useSearchTrustedRatingSummaries } from '@/modules/trusted-rating-context/get-search-trusted-rating-summaries/use-search-trusted-rating-summaries';
import type { TrustedRatingSummary } from '@/modules/trusted-rating-context/trusted-rating-context.types';
import { AddToWatchlistButton } from '@/modules/watchlist/add-to-watchlist/add-to-watchlist-button';
import { CardContent, CardFooter } from '@/shared/ui/card';
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
    <main className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-8">
      <header className="mb-6 space-y-3">
        <div>
          <h1 className="text-2xl font-bold">Buscar títulos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Encontrá una película o serie para calificarla o guardarla.
          </p>
        </div>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-primary"
          />
          <Input
            aria-label="Buscar película o serie"
            autoFocus
            className="min-h-11 w-full px-10"
            name="q"
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="Película o serie"
            type="search"
            value={query}
          />
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
    <section aria-label="Resultados de búsqueda" className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {movies.length} {movies.length === 1 ? 'resultado' : 'resultados'}
      </p>
      <MovieGrid>
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
      </MovieGrid>
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
  return (
    <MovieCard>
      <Link href={`/media/${movie.kind}/${movie.tmdbId}`}>
        <MoviePoster posterPath={movie.posterPath} title={movie.title} />
      </Link>
      <CardContent className="flex flex-col gap-2 px-4 pt-2">
        <Link
          className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href={`/media/${movie.kind}/${movie.tmdbId}`}
        >
          <MovieTitle title={movie.title} />
        </Link>
        <div className="flex items-center justify-between gap-2">
          <MovieReleaseDate year={movie.year} />
          <MovieMediaKind kind={movie.kind} />
        </div>
        <SearchTrustedRating
          isLoading={isTrustedRatingLoading}
          summary={trustedRating}
        />
      </CardContent>
      <CardFooter className="flex justify-end gap-2 px-4 pb-4">
        <div className="flex-1 md:flex-initial">
          <AddToWatchlistButton kind={movie.kind} tmdbId={movie.tmdbId} />
        </div>
        <div className="flex-1 md:flex-initial">
          <RateDialog
            kind={movie.kind}
            posterPath={movie.posterPath}
            title={movie.title}
            tmdbId={movie.tmdbId}
            year={movie.year}
          />
        </div>
      </CardFooter>
    </MovieCard>
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
      <div className="border-border border-t pt-2">
        <Skeleton className="h-7 w-4/5" />
      </div>
    );
  }

  return summary ? <TrustedRatingSummaryView summary={summary} /> : null;
}

const SEARCH_SKELETON_KEYS = [
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
] as const;

function SearchResultsSkeleton() {
  return (
    <MovieGrid>
      {SEARCH_SKELETON_KEYS.map((key) => (
        <div key={key}>
          <Skeleton className="aspect-[2/3] w-full rounded-xs" />
          <div className="space-y-2 pt-2">
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-5 w-2/5" />
          </div>
        </div>
      ))}
    </MovieGrid>
  );
}
