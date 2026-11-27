'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import {
  AlignJustify,
  ArrowDown,
  ArrowUp,
  Grid2X2,
  ListFilter,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  MovieCard,
  MoviePoster,
  MovieReleaseDate,
  MovieScore,
  MovieTitle,
} from '@/modules/media-catalog/components/movie-card';
import { MovieGrid } from '@/modules/media-catalog/components/movie-grid';
import { MovieList } from '@/modules/media-catalog/components/movie-list';
import { MovieWatchProviders } from '@/modules/media-catalog/get-watch-providers/movie-watch-providers';
import { KIND_FILTER_DICT } from '@/modules/media-catalog/media.constants';
import { getMediaIdentityKey } from '@/modules/media-catalog/media-identity';
import type { MovieView } from '@/modules/media-catalog/movie-view';
import {
  parseProfileRatingsFilters,
  serializeProfileRatingsFilters,
} from '@/modules/ratings/list-profile-ratings/filters/filter-user-movies-parser';
import {
  PROFILE_RATINGS_GRID_CLASS_NAME,
  PROFILE_RATINGS_VIEW_STORAGE_KEY,
  PROFILE_RATINGS_VIEWS,
  type ProfileRatingsView,
} from '@/modules/ratings/list-profile-ratings/profile-ratings.constants';
import type { ProfileRatingsFilters } from '@/modules/ratings/list-profile-ratings/profile-ratings.types';
import { getProfileRatingsQueryOptions } from '@/modules/ratings/list-profile-ratings/use-user-movies';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { cn } from '@/shared/utilities/utils';

export function ProfileRatingsClient({
  profileUserId,
  viewerUserId,
}: {
  profileUserId: string;
  viewerUserId: string;
}) {
  const searchParams = useSearchParams();
  const filters = parseProfileRatingsFilters(searchParams);

  const { data, isPending, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      getProfileRatingsQueryOptions(viewerUserId, profileUserId, filters)
    );

  const profileMovies = data?.pages.flatMap((page) => page.data);

  const [tab, setTab] = useState<ProfileRatingsView>(
    PROFILE_RATINGS_VIEWS.grid
  );

  // biome-ignore lint: only need this to run on first render
  useEffect(() => {
    const savedTab = localStorage.getItem(PROFILE_RATINGS_VIEW_STORAGE_KEY);
    if (
      (savedTab === PROFILE_RATINGS_VIEWS.grid ||
        savedTab === PROFILE_RATINGS_VIEWS.list) &&
      savedTab !== tab
    ) {
      setTab(savedTab);
    }
  }, []);

  const onTabChange = (value: string) => {
    if (
      value !== PROFILE_RATINGS_VIEWS.grid &&
      value !== PROFILE_RATINGS_VIEWS.list
    ) {
      return;
    }
    localStorage.setItem(PROFILE_RATINGS_VIEW_STORAGE_KEY, value);
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
      <RatingFilters isOwner={viewerUserId === profileUserId} />

      <TabsContent value="grid">
        <MovieGrid className={PROFILE_RATINGS_GRID_CLASS_NAME}>
          {isPending && <p>Cargando...</p>}

          {profileMovies?.map((movie) => (
            <ProfileRatingGridItem
              key={getMediaIdentityKey(movie.tmdbId, movie.kind)}
              movie={movie}
            />
          ))}
        </MovieGrid>

        {hasNextPage && (
          <LoadNextPageButton
            isFetchingNextPage={isFetchingNextPage}
            onFecthNextPage={handleFetchNextPage}
          />
        )}
      </TabsContent>

      <TabsContent value="list">
        <MovieList>
          {isPending && <p>Cargando...</p>}

          {profileMovies?.map((movie, idx) => (
            <MovieCard key={getMediaIdentityKey(movie.tmdbId, movie.kind)}>
              <div className="flex gap-6">
                <p className="hidden pl-2 font-bold md:block">{idx + 1}</p>

                <div className="flex flex-1 gap-4">
                  <MoviePoster
                    posterPath={movie.posterPath}
                    size="small"
                    title={movie.title}
                  />

                  <div className="flex flex-col gap-2 md:flex-1 md:flex-row md:gap-4">
                    <div className="pt-2 md:flex-1">
                      <MovieTitle
                        className="font-bold text-lg"
                        title={movie.title}
                      />
                      <MovieReleaseDate year={movie.year} />
                    </div>
                    <div className="flex items-center gap-4 md:pr-4">
                      <MovieWatchProviders
                        kind={movie.kind}
                        tmdbId={movie.tmdbId}
                      />
                    </div>
                  </div>

                  <div className="ml-auto self-center px-2 md:px-4">
                    <MovieScore score={movie.score} />
                  </div>
                </div>
              </div>
            </MovieCard>
          ))}

          {hasNextPage && (
            <LoadNextPageButton
              isFetchingNextPage={isFetchingNextPage}
              onFecthNextPage={handleFetchNextPage}
            />
          )}
        </MovieList>
      </TabsContent>
    </Tabs>
  );
}

function ProfileRatingGridItem({ movie }: { movie: MovieView }) {
  return (
    <Link
      aria-label={movie.title}
      className="group block overflow-hidden rounded-sm bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      href={`/media/${movie.kind}/${movie.tmdbId}`}
    >
      <MoviePoster
        className="rounded-none"
        posterPath={movie.posterPath}
        title={movie.title}
      />
      <div className="px-2 py-1">
        <p className="truncate font-semibold text-sm leading-5 group-hover:underline group-active:underline">
          {movie.title}
        </p>
        <div className="flex h-5 items-baseline justify-between gap-2 leading-5">
          <span className="text-muted-foreground text-sm leading-5">
            {movie.year}
          </span>
          {movie.score != null && (
            <span className="whitespace-nowrap tabular-nums">
              <span className="sr-only">Calificación: </span>
              <span className="font-semibold text-base text-primary leading-5">
                {movie.score}
              </span>
              <span className="text-muted-foreground text-xs">/10</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

type RatingSort = Pick<ProfileRatingsFilters, 'sortBy' | 'sortOrder'>;

const SORT_OPTIONS = [
  { sortBy: 'watchedDate', sortOrder: 'desc', label: 'Más recientes' },
  { sortBy: 'watchedDate', sortOrder: 'asc', label: 'Más antiguas' },
  { sortBy: 'score', sortOrder: 'desc', label: 'Mayor puntaje' },
  { sortBy: 'score', sortOrder: 'asc', label: 'Menor puntaje' },
] satisfies readonly (RatingSort & { label: string })[];

const getSortValue = ({ sortBy, sortOrder }: RatingSort) =>
  `${sortBy}:${sortOrder}`;

function RatingFilters({ isOwner }: { isOwner: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = parseProfileRatingsFilters(searchParams);

  const updateFilters = (updates: Partial<ProfileRatingsFilters>) => {
    const params = serializeProfileRatingsFilters(
      { ...filters, ...updates },
      new URLSearchParams(searchParams.toString())
    );
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  const hideSharedRatings = !isOwner && filters.bothRated;
  const hasActiveFilters = filters.kindFilter !== 'all' || hideSharedRatings;
  const sortValue = getSortValue(filters);
  const sortLabel = filters.sortBy === 'score' ? 'Puntaje' : 'Fecha';
  const isAscending = filters.sortOrder === 'asc';

  const handleSortChange = (value: string) => {
    const option = SORT_OPTIONS.find((item) => getSortValue(item) === value);
    if (option) {
      const { sortBy, sortOrder } = option;
      updateFilters({ sortBy, sortOrder });
    }
  };

  const handleFilterByChange = (value: string) => {
    if (value === 'all' || value === 'movie' || value === 'tv_series') {
      updateFilters({ kindFilter: value });
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 py-2 md:justify-end">
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label={hasActiveFilters ? 'Filtros activos' : undefined}
              className={cn(
                'relative h-10 min-w-20 bg-transparent',
                hasActiveFilters &&
                  'border-primary/20 bg-primary/10 text-primary'
              )}
              size="sm"
              variant="outline"
            >
              <ListFilter aria-hidden="true" className="size-4" />
              Filtros
              {hasActiveFilters && (
                <span className="absolute top-1 right-1 size-1.5 rounded-full bg-primary" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Tipo de contenido</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              aria-label="Tipo de contenido"
              onValueChange={handleFilterByChange}
              value={filters.kindFilter}
            >
              {Object.entries({ ...KIND_FILTER_DICT, all: 'Todo' }).map(
                ([kind, label]) => (
                  <DropdownMenuRadioItem
                    className="min-h-10"
                    key={kind}
                    value={kind}
                  >
                    {label}
                  </DropdownMenuRadioItem>
                )
              )}
            </DropdownMenuRadioGroup>
            {!isOwner && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={hideSharedRatings}
                  className="min-h-10"
                  onCheckedChange={(checked) =>
                    updateFilters({ bothRated: checked })
                  }
                >
                  Ocultar títulos que ambos calificaron
                </DropdownMenuCheckboxItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label={`${sortLabel}, orden ${isAscending ? 'ascendente' : 'descendente'}`}
              className="h-10 min-w-24 bg-transparent"
              size="sm"
              variant="outline"
            >
              {sortLabel}
              {isAscending ? (
                <ArrowUp aria-hidden="true" className="size-4" />
              ) : (
                <ArrowDown aria-hidden="true" className="size-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuRadioGroup
              aria-label="Orden"
              onValueChange={handleSortChange}
              value={sortValue}
            >
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuRadioItem
                  className="min-h-10"
                  key={getSortValue(option)}
                  value={getSortValue(option)}
                >
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <TabsList
        aria-label="Vista de calificaciones"
        className="h-auto shrink-0 p-0.5"
      >
        <TabsTrigger aria-label="Cuadrícula" className="size-10" value="grid">
          <Grid2X2 aria-hidden="true" />
        </TabsTrigger>
        <TabsTrigger aria-label="Lista" className="size-10" value="list">
          <AlignJustify aria-hidden="true" />
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
    <div className="mt-4 flex justify-center">
      <Button
        disabled={isFetchingNextPage}
        onClick={onFecthNextPage}
        type="button"
      >
        {isFetchingNextPage ? 'Cargando...' : 'Ver más'}
      </Button>
    </div>
  );
}
