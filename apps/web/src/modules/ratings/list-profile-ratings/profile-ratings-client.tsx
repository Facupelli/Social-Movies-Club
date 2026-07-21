'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import {
  AlignJustify,
  ArrowDown,
  ArrowUp,
  Calendar,
  Grid2X2,
  Star,
  Users,
  UserX,
} from 'lucide-react';
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
import { TYPE_FILTER_DICT } from '@/modules/media-catalog/media.constants';
import { getMediaIdentityKey } from '@/modules/media-catalog/media-identity';
import {
  parseProfileRatingsFilters,
  serializeProfileRatingsFilters,
} from '@/modules/ratings/list-profile-ratings/filters/filter-user-movies-parser';
import {
  PROFILE_RATINGS_VIEWS,
  PROFILE_RATINGS_VIEW_STORAGE_KEY,
  type ProfileRatingsView,
} from '@/modules/ratings/list-profile-ratings/profile-ratings.constants';
import { getProfileRatingsQueryOptions } from '@/modules/ratings/list-profile-ratings/use-user-movies';
import { Button } from '@/shared/ui/button';
import { CardContent } from '@/shared/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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
        <MovieGrid>
          {isPending && <p>Cargando...</p>}

          {profileMovies?.map((movie) => (
            <MovieCard key={getMediaIdentityKey(movie.tmdbId, movie.type)}>
              <MoviePoster posterPath={movie.posterPath} title={movie.title} />
              <CardContent className="flex flex-col gap-1 px-4 py-2">
                <MovieTitle title={movie.title} />
                <div className="flex items-center justify-between">
                  <MovieReleaseDate year={movie.year} />
                  <MovieScore score={movie.score} />
                </div>
              </CardContent>
            </MovieCard>
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
            <MovieCard key={getMediaIdentityKey(movie.tmdbId, movie.type)}>
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
                        tmdbId={movie.tmdbId}
                        type={movie.type}
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

function RatingFilters({ isOwner }: { isOwner: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = parseProfileRatingsFilters(searchParams);

  const updateFilters = (
    updates: Partial<ReturnType<typeof parseProfileRatingsFilters>>
  ) => {
    const params = serializeProfileRatingsFilters(
      { ...filters, ...updates },
      new URLSearchParams(searchParams.toString())
    );
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  const hideSharedRatings = !!filters.bothRated;
  const toggleSharedRatings = () => {
    const newBothRated = !filters.bothRated;
    updateFilters({ bothRated: newBothRated });
  };

  const toggleSortOrder = () => {
    const newOrder = filters.sortOrder === 'asc' ? 'desc' : 'asc';
    updateFilters({ sortOrder: newOrder });
  };

  const handleSortByChange = (value: string) => {
    if (value === 'score' || value === 'createdAt') {
      updateFilters({ sortBy: value });
    }
  };

  const handleFilterByChange = (value: string) => {
    if (value === 'all' || value === 'movie' || value === 'tv') {
      updateFilters({ typeFilter: value });
    }
  };

  const getSortLabel = () => {
    return filters.sortBy === 'score' ? 'Puntaje' : 'Fecha';
  };

  return (
    <div className="overflow-x-auto flex justify-between gap-4 py-4 md:justify-end">
      <div className="flex h-9 items-center gap-4">
        {!isOwner && (
          <Button
            className={cn(
              'h-[calc(100%-1px)] gap-2 bg-transparent transition-colors',
              hideSharedRatings &&
                'bg-primary/10 text-primary border-primary/20'
            )}
            onClick={toggleSharedRatings}
            title={
              hideSharedRatings ? 'Ocultar compartidas' : 'Mostrar compartidas'
            }
            variant="outline"
          >
            {hideSharedRatings ? (
              <Users className="size-4" />
            ) : (
              <UserX className="size-4" />
            )}
            <span className="font-normal text-neutral-500">
              {hideSharedRatings ? 'Mostrar' : 'Ocultar'} compartidas
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
                {filters.sortBy === 'score' ? (
                  <Star className="size-4" />
                ) : (
                  <Calendar className="size-4" />
                )}
                <span className="font-normal text-neutral-500">
                  Ordenar por
                </span>{' '}
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
            title={`Sort ${filters.sortOrder === 'asc' ? 'ascending' : 'descending'}`}
            variant="outline"
          >
            {filters.sortOrder === 'asc' ? (
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
        disabled={isFetchingNextPage}
        onClick={onFecthNextPage}
        type="button"
      >
        {isFetchingNextPage ? 'Cargando...' : 'Ver más'}
      </Button>
    </div>
  );
}
