'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { Clapperboard, Search, UserPlus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useDeferredValue, useEffect, useState } from 'react';
import {
  MovieCard,
  MovieMediaType,
  MoviePoster,
  MovieReleaseDate,
  MovieScore,
  MovieTitle,
} from '@/modules/media-catalog/components/movie-card';
import { MovieGrid } from '@/modules/media-catalog/components/movie-grid';
import { MovieWatchProviders } from '@/modules/media-catalog/get-watch-providers/movie-watch-providers';
import { TYPE_DICT } from '@/modules/media-catalog/media.constants';
import { getMediaIdentityKey } from '@/modules/media-catalog/media-identity';
import useDebounce from '@/modules/media-catalog/search-media/use-debounce';
import { useSearchMedia } from '@/modules/media-catalog/search-media/use-search-media';
import { RateDialog } from '@/modules/ratings/rate-media/rate-dialog';
import type { FeedItem } from '@/modules/timeline/view-timeline/feed.types';
import { FeedSkeleton } from '@/modules/timeline/view-timeline/home-page-skeleton';
import { getUserFeedQueryOptions } from '@/modules/timeline/view-timeline/use-user-feed';
import { AddToWatchlistButton } from '@/modules/watchlist/add-to-watchlist/add-to-watchlist-button';
import SignInButton from '@/shared/components/sign-in-button';
import { useIsMobile } from '@/shared/hooks/use-mobile';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { CardContent, CardFooter } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';
import { formatFeedItemTime } from '@/shared/utilities/utils';

export function HomePageClient({
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
  const debouncedSearchTerm = debouncedQuery.length >= 3 ? debouncedQuery : '';

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
  }, [searchParams]);

  const handleSearch = (value: string) => {
    setQuery(value);

    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('q', value);
    } else {
      params.delete('q');
    }

    const queryString = params.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;
    window.history.replaceState(window.history.state, '', url);
  };

  return (
    <div className="relative min-h-svh flex-1 py-6 md:min-h-auto">
      <div className="relative z-20 px-2 pb-2 md:px-10 md:pb-6">
        <SearchInput onChange={handleSearch} value={query} />
      </div>

      <HomeContent
        debouncedSearchTerm={debouncedSearchTerm}
        viewerUserId={viewerUserId}
      />
    </div>
  );
}

function HomeContent({
  debouncedSearchTerm,
  viewerUserId,
}: {
  debouncedSearchTerm: string;
  viewerUserId?: string;
}) {
  const hasQuery = !!debouncedSearchTerm;

  if (hasQuery) {
    return <MoviesList debouncedSearchTerm={debouncedSearchTerm} />;
  }

  return (
    <>
      <SessionMessage isAuthenticated={Boolean(viewerUserId)} />
      <Feed viewerUserId={viewerUserId} />
    </>
  );
}

function SearchInput({
  onChange,
  value,
}: {
  onChange: (values: string) => void;
  value: string;
}) {
  return (
    <div className="relative">
      <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-primary" />
      <Input
        className="w-full px-10"
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar película o serie"
        type="search"
        value={value}
      />
    </div>
  );
}

function SessionMessage({ isAuthenticated }: { isAuthenticated: boolean }) {
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center px-4 pt-10">
        <div className="space-y-2 text-balance text-center">
          <p>Inicia sesión para calificar películas y seguir a tus amigos!</p>
          <SignInButton />
        </div>
      </div>
    );
  }

  return null;
}

function Feed({ viewerUserId }: { viewerUserId?: string }) {
  const { data, isPending, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(getUserFeedQueryOptions(viewerUserId));

  if (!viewerUserId) {
    return null;
  }

  if (isPending) {
    return <FeedSkeleton />;
  }

  const flatItems = data?.pages.flatMap((page) => page.items);

  if (!flatItems || flatItems.length <= 0) {
    return (
      <div>
        <div className="absolute inset-0 bg-radial from-primary to-background z-0 opacity-10" />

        <div className="relative z-20 flex flex-col items-center gap-y-2 py-10">
          <div>
            <Clapperboard className="text-primary size-12" />
          </div>
          <p className="text-xl font-bold text-center">
            Tu feed está un poco vacío
          </p>
          <p className="text-muted-foreground text-sm text-center">
            Sigue a tus amigos para ver sus críticas o empieza a puntuar
            películas para recibir recomendaciones
          </p>
          <div className="pt-4">
            <Button asChild className="font-semibold">
              <Link href="/users">
                <UserPlus className="size-5" />
                Encuentra a tus amigos
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="divide-y divide-border">
        {flatItems.map((item) => (
          <div className="px-2 md:px-10" key={item.feedItemId}>
            <FeedItemCard item={item} />
          </div>
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center py-4">
          <Button
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
            type="button"
          >
            {isFetchingNextPage ? 'Cargando más...' : 'Cargar más'}
          </Button>
        </div>
      )}
    </div>
  );
}

function FeedItemCard({ item }: { item: FeedItem }) {
  const isMobile = useIsMobile();

  return (
    <MovieCard className="w-full py-4 px-2 md:px-0 overflow-hidden shadow-none border-none bg-transparent">
      <div className="flex flex-col md:flex-row gap-2 md:gap-6">
        <div className="md:block hidden">
          <Link
            className="size-[30px] rounded-full bg-accent-foreground md:size-[50px]"
            href={`/profile/${item.actorId}`}
          >
            <Avatar className="size-7 md:size-10">
              <AvatarImage
                alt={item.actorName}
                src={item.actorImage || '/placeholder.svg'}
              />
              <AvatarFallback>
                {item.actorName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>

        <div className="relative flex-shrink-0 w-full md:w-44">
          <div className="sticky top-0">
            <div className="relative">
              <Image
                alt={item.movieTitle}
                className="rounded-xs object-cover w-full h-auto max-h-[250px] md:max-h-[300px]"
                height={288}
                src={
                  (isMobile
                    ? `https://image.tmdb.org/t/p/w500${item.movieBackdrop}`
                    : `https://image.tmdb.org/t/p/original${item.moviePoster}`) ||
                  '/placeholder.svg?height=288&width=192'
                }
                unoptimized
                width={192}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xs" />

              <Badge
                className="absolute top-2 right-2 text-xs font-medium bg-black/60 text-white border-0"
                variant="secondary"
              >
                {TYPE_DICT[item.movieType]}
              </Badge>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <p className="text-xs font-medium opacity-90">
                  {item.movieYear}
                </p>
              </div>

              <div className="absolute right-2 bottom-2">
                <AddToWatchlistButton
                  className="bg-secondary/50"
                  tmdbId={item.movieTmdbId}
                  type={item.movieType}
                  variant="secondary"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1  flex flex-col">
          <div className="grid ">
            <div className="flex items-baseline">
              <div className="flex-1">
                <MovieTitle className="md:text-xl" title={item.movieTitle} />
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                <span>hace</span>
                {formatFeedItemTime(item.ratedAt)}
              </div>
            </div>

            <div className="flex-1 pt-2">
              <Accordion collapsible type="single">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="py-0 pb-2">
                    Sinopsis
                  </AccordionTrigger>
                  <AccordionContent>{item.movieOverview}</AccordionContent>
                </AccordionItem>
              </Accordion>
              <MovieWatchProviders
                tmdbId={item.movieTmdbId}
                type={item.movieType}
              />
            </div>
          </div>

          <div className="mt-auto pt-4 md:pt-2">
            <div className="flex items-center gap-2 md:gap-4 p-3 bg-muted/50 rounded-sm">
              <Link
                className="size-[30px] rounded-full bg-accent-foreground md:size-[50px] md:hidden"
                href={`/profile/${item.actorId}`}
              >
                <Avatar className="size-7 md:size-10">
                  <AvatarImage
                    alt={item.actorName}
                    src={item.actorImage || '/placeholder.svg'}
                  />
                  <AvatarFallback>
                    {item.actorName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>

              <div className="flex-1 flex md:justify-between gap-3 md:gap-0 items-center pr-2">
                <div className="grid md:gap-1">
                  <div className="flex lead items-center gap-2">
                    <span className="font-semibold text-sm">
                      {item.actorName}
                    </span>
                  </div>
                  <span className="text-xs lead text-muted-foreground">
                    {item.actorUsername}
                  </span>
                </div>
              </div>

              <MovieScore score={item.score} />
            </div>
          </div>
        </div>
      </div>
    </MovieCard>
  );
}

function MoviesList({ debouncedSearchTerm }: { debouncedSearchTerm: string }) {
  const {
    data: movies,
    isLoading,
    error,
  } = useSearchMedia(debouncedSearchTerm);

  if (isLoading) {
    return (
      <div className="px-2 pt-2 md:px-10">
        <MovieGrid>
          {[...Array(10)].map((_, i) => (
            // biome-ignore lint: reason
            <div key={i}>
              <Skeleton className="aspect-[2/3] w-full rounded-xs bg-muted" />
              <div className="grid gap-1 pt-2">
                <Skeleton className="h-5 w-[120px]" />
                <Skeleton className="h-5 w-[70px]" />
              </div>
            </div>
          ))}
        </MovieGrid>
      </div>
    );
  }

  if (error) {
    return <p>Error {JSON.stringify(error)}</p>;
  }

  return (
    <div className="px-2 pt-2 md:px-10">
      <MovieGrid>
        {movies?.map((movie) => (
          <MovieCard key={getMediaIdentityKey(movie.tmdbId, movie.type)}>
            <MoviePoster posterPath={movie.posterPath} title={movie.title} />
            <CardContent className="flex flex-col gap-1 px-4 pt-2">
              <MovieTitle title={movie.title} />
              <div className="flex items-center justify-between">
                <MovieReleaseDate year={movie.year} />
                <MovieMediaType type={movie.type} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 px-4 pb-4">
              <div className="flex-1 md:flex-initial">
                <AddToWatchlistButton tmdbId={movie.tmdbId} type={movie.type} />
              </div>
              <div className="flex-1 md:flex-initial">
                <RateDialog
                  posterPath={movie.posterPath}
                  title={movie.title}
                  tmdbId={movie.tmdbId}
                  type={movie.type}
                  year={movie.year}
                />
              </div>
            </CardFooter>
          </MovieCard>
        ))}
      </MovieGrid>
    </div>
  );
}
