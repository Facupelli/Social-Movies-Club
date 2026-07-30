'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { Clapperboard, UserPlus } from 'lucide-react';
import Image, { getImageProps } from 'next/image';
import Link from 'next/link';

import {
  MovieCard,
  MovieScore,
  MovieTitle,
} from '@/modules/media-catalog/components/movie-card';
import { MovieWatchProviders } from '@/modules/media-catalog/get-watch-providers/movie-watch-providers';
import { KIND_DICT } from '@/modules/media-catalog/media.constants';
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
import { formatFeedItemTime } from '@/shared/utilities/utils';

export function HomePageClient({ viewerUserId }: { viewerUserId?: string }) {
  return (
    <div className="relative min-h-svh flex-1 py-6 md:min-h-auto">
      <SessionMessage isAuthenticated={Boolean(viewerUserId)} />
      <Feed viewerUserId={viewerUserId} />
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
  const {
    data,
    isPending,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery(getUserFeedQueryOptions(viewerUserId));

  if (!viewerUserId) {
    return null;
  }

  if (isPending) {
    return <FeedSkeleton />;
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-md space-y-3 px-4 py-12 text-center">
        <p className="font-semibold">No pudimos cargar tu feed</p>
        <p className="text-muted-foreground text-sm">
          Revisá tu conexión e intentá nuevamente.
        </p>
        <Button onClick={() => refetch()} type="button" variant="secondary">
          Reintentar
        </Button>
      </div>
    );
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
              <FeedAvatarImage alt={item.actorName} src={item.actorImage} />
              <AvatarFallback>
                {item.actorName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>

        <div className="relative flex-shrink-0 w-full md:w-44">
          <div className="sticky top-0">
            <div className="relative">
              <Link href={`/media/${item.kind}/${item.movieTmdbId}`}>
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
              </Link>

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xs" />

              <Badge
                className="absolute top-2 right-2 text-xs font-medium bg-black/60 text-white border-0"
                variant="secondary"
              >
                {KIND_DICT[item.kind]}
              </Badge>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <p className="text-xs font-medium opacity-90">
                  {item.movieYear}
                </p>
              </div>

              <div className="absolute right-2 bottom-2">
                <AddToWatchlistButton
                  className="bg-secondary/50"
                  kind={item.kind}
                  tmdbId={item.movieTmdbId}
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
                <Link
                  className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  href={`/media/${item.kind}/${item.movieTmdbId}`}
                >
                  <MovieTitle className="md:text-xl" title={item.movieTitle} />
                </Link>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                <span>hace</span>
                {formatFeedItemTime(item.occurredAt)}
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
              <MovieWatchProviders kind={item.kind} tmdbId={item.movieTmdbId} />
            </div>
          </div>

          <div className="mt-auto pt-4 md:pt-2">
            <div className="flex items-center gap-2 md:gap-4 p-3 bg-muted/50 rounded-sm">
              <Link
                className="size-[30px] rounded-full bg-accent-foreground md:size-[50px] md:hidden"
                href={`/profile/${item.actorId}`}
              >
                <Avatar className="size-7 md:size-10">
                  <FeedAvatarImage alt={item.actorName} src={item.actorImage} />
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

            <TimelineTrustedContext item={item} />
          </div>
        </div>
      </div>
    </MovieCard>
  );
}

function TimelineTrustedContext({ item }: { item: FeedItem }) {
  const context = item.trustedRatingContext;
  if (!context || context.otherRaterCount === 0) {
    return null;
  }

  const firstRater = context.otherPreviewRaters[0];
  const remainingCount = context.otherRaterCount - 1;

  return (
    <div className="mt-2 flex items-center gap-2 px-1">
      <div aria-hidden="true" className="flex shrink-0 -space-x-2">
        {context.otherPreviewRaters.map((rater) => (
          <Avatar className="size-7 border-2 border-background" key={rater.userId}>
            {rater.avatarUrl ? <AvatarImage alt="" src={rater.avatarUrl} /> : null}
            <AvatarFallback className="text-[10px]">
              {rater.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <p className="min-w-0 text-muted-foreground text-xs leading-snug">
        <span className="text-foreground">{firstRater?.displayName}</span>
        {remainingCount > 0 ? ` y ${remainingCount} más` : ''} también{' '}
        {context.otherRaterCount === 1 ? 'la calificó' : 'la calificaron'}
        {context.summary.averageScore !== null ? (
          <>
            {' '}
            · promedio{' '}
            <strong className="text-primary tabular-nums">
              {context.summary.averageScore.toFixed(1)}
            </strong>
          </>
        ) : null}
      </p>
    </div>
  );
}

function FeedAvatarImage({ alt, src }: { alt: string; src: string | null }) {
  if (!src) {
    return null;
  }

  const { props } = getImageProps({
    alt,
    height: 40,
    sizes: '(min-width: 768px) 40px, 28px',
    src,
    width: 40,
  });

  return <AvatarImage {...props} />;
}
