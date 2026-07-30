'use client';

import { Search, X } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useDeferredValue, useEffect, useState } from 'react';
import { MediaListCard } from '@/modules/media-catalog/components/media-list-card';
import { getMediaIdentityKey } from '@/modules/media-catalog/media-identity';
import { useSearchTrustedRatingSummaries } from '@/modules/trusted-rating-context/get-search-trusted-rating-summaries/use-search-trusted-rating-summaries';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { SearchResultsSkeleton } from './search-results-skeleton';
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
          <MediaListCard
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
