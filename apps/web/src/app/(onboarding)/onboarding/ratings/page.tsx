'use client';

import { useQuery } from '@tanstack/react-query';
import { Check, Film, Search } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDeferredValue, useState } from 'react';
import { MediaKindDict } from '@/modules/media-catalog/media.type';
import { getMediaIdentityKey } from '@/modules/media-catalog/media-identity';
import useDebounce from '@/modules/media-catalog/search-media/use-debounce';
import { useSearchMedia } from '@/modules/media-catalog/search-media/use-search-media';
import { getUserRatingsQueryOptions } from '@/modules/ratings/get-rating-status/use-user-ratings';
import { RatingInput } from '@/modules/ratings/rate-media/rating-input';
import { useRateMediaMutation } from '@/modules/ratings/rate-media/use-rate-media-mutation';
import { authClient } from '@/platform/auth/auth-client';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';

const TARGET_COUNT = 5;

function getLocalTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function OnboardingRatingsPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const viewerUserId = session?.user.id;
  const { data: ratingStatus } = useQuery(
    getUserRatingsQueryOptions(viewerUserId)
  );
  const mutateRateMedia = useRateMediaMutation(viewerUserId, {
    publicationMode: 'publish',
    recommendationCache: 'invalidate',
  });

  const ratedCount = ratingStatus ? Object.keys(ratingStatus).length : 0;
  const displayCount = Math.min(ratedCount, TARGET_COUNT);
  const hasMinRatings = ratedCount >= 1;

  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim());
  const debouncedQuery = useDebounce(deferredQuery, 400);
  const searchTerm = debouncedQuery.length >= 3 ? debouncedQuery : '';

  const { data: movies = [], isLoading } = useSearchMedia(searchTerm);

  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

  const handleRate = async (
    tmdbId: number,
    kind: 'movie' | 'tv_series',
    score: number
  ) => {
    const identityKey = getMediaIdentityKey(tmdbId, kind);
    setSavingIds((prev) => new Set(prev).add(identityKey));

    const formData = new FormData();
    formData.set('movieTMDBId', String(tmdbId));
    formData.set('rating', String(score));
    formData.set('kind', kind);
    formData.set('watchedDate', getLocalTodayDate());

    await mutateRateMedia(formData, {
      tmdbId,
      kind,
      score,
      watchedDate: getLocalTodayDate(),
    });

    setSavingIds((prev) => {
      const next = new Set(prev);
      next.delete(identityKey);
      return next;
    });
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col px-4 py-6 md:px-8">
      <div className="shrink-0">
        <h1 className="font-bold text-xl tracking-tight">
          ¿Qué viste últimamente?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Calificá al menos 1 título para continuar. Si calificás hasta 5, vamos
          a conocerte mejor.
        </p>
      </div>

      <div className="mt-5 flex shrink-0 items-center gap-3">
        <div className="flex-1">
          <div className="h-1.5 w-full rounded-full bg-muted">
            <div
              className="h-1.5 rounded-full bg-primary transition-all duration-300"
              style={{
                width: `${(displayCount / TARGET_COUNT) * 100}%`,
              }}
            />
          </div>
        </div>
        <span className="min-w-0 shrink-0 font-semibold text-sm tabular-nums">
          {displayCount === TARGET_COUNT ? (
            <span className="inline-flex items-center gap-1 text-primary">
              <Check className="size-4" />
              {displayCount}/{TARGET_COUNT}
            </span>
          ) : (
            <span className="text-muted-foreground">
              {displayCount}/{TARGET_COUNT}
            </span>
          )}
        </span>
      </div>

      <div className="relative mt-6 shrink-0">
        <Search
          aria-hidden="true"
          className="-translate-y-1/2 absolute top-1/2 left-4 size-5 text-muted-foreground"
        />
        <Input
          aria-label="Buscar película o serie"
          className="h-12 pl-11 text-base"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscá película o serie"
          type="search"
          value={query}
        />
      </div>

      <div className="mt-6 min-h-0 flex-1 overflow-y-auto pb-3">
        {!searchTerm && (
          <p className="grid h-full place-items-center text-center text-sm text-muted-foreground">
            Buscá una película o serie que hayas visto recientemente.
          </p>
        )}

        {searchTerm && isLoading && <RatingsSearchSkeleton />}

        {searchTerm && !isLoading && movies.length === 0 && (
          <p className="grid h-full place-items-center text-center text-sm text-muted-foreground">
            No encontramos resultados para &ldquo;{searchTerm}&rdquo;.
          </p>
        )}

        {searchTerm && !isLoading && movies.length > 0 && (
          <ul className="space-y-3 pr-1">
            {movies.map((movie) => {
              const identityKey = getMediaIdentityKey(movie.tmdbId, movie.kind);
              const existingRating = ratingStatus?.[identityKey];
              const isSaving = savingIds.has(identityKey);

              return (
                <li
                  className="overflow-hidden rounded-md border border-border bg-card"
                  key={identityKey}
                >
                  <div className="flex gap-3 p-3">
                    <div className="relative aspect-[2/3] h-[96px] shrink-0 overflow-hidden rounded-sm bg-muted">
                      {movie.posterPath ? (
                        <Image
                          alt={movie.title}
                          className="object-cover"
                          fill
                          sizes="96px"
                          src={`https://image.tmdb.org/t/p/w342${movie.posterPath}`}
                          unoptimized
                        />
                      ) : (
                        <div className="grid size-full place-items-center text-muted-foreground">
                          <Film className="size-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <h2 className="truncate font-semibold text-sm">
                        {movie.title}
                      </h2>
                      <p className="text-muted-foreground text-xs">
                        {movie.year} · {MediaKindDict[movie.kind]}
                      </p>

                      <div className="mt-auto">
                        {existingRating && (
                          <div className="flex items-center gap-2 pt-1">
                            <span className="font-semibold text-primary text-sm tabular-nums">
                              {existingRating.score}/10
                            </span>
                            <span className="text-muted-foreground text-xs">
                              Calificada
                            </span>
                          </div>
                        )}
                        {!existingRating && isSaving && (
                          <div className="pt-1">
                            <Skeleton className="h-7 w-full rounded-lg" />
                          </div>
                        )}
                        {!(existingRating || isSaving) && (
                          <RatingInput
                            onChange={(score) =>
                              handleRate(movie.tmdbId, movie.kind, score)
                            }
                            size="sm"
                            value={0}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="shrink-0 pt-4">
        <Button
          className="h-12 w-full text-base"
          disabled={!hasMinRatings}
          onClick={() => router.push('/onboarding/people')}
        >
          Continuar
        </Button>
        {!hasMinRatings && (
          <p className="mt-2 text-center text-muted-foreground text-xs">
            Calificá al menos 1 título para continuar
          </p>
        )}
        {hasMinRatings && displayCount < TARGET_COUNT && (
          <p className="mt-2 text-center text-muted-foreground text-xs">
            {TARGET_COUNT - ratedCount} más para mejorar tus recomendaciones
          </p>
        )}
      </div>
    </section>
  );
}

function RatingsSearchSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          className="overflow-hidden rounded-md border border-border bg-card p-3"
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
          key={i}
        >
          <div className="flex gap-3">
            <Skeleton className="aspect-[2/3] h-[96px] shrink-0 rounded-sm" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="mt-auto">
                <Skeleton className="h-7 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
