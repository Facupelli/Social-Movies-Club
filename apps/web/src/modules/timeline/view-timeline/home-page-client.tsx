'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { Clapperboard, MoreHorizontal, UserPlus } from 'lucide-react';
import Image, { getImageProps } from 'next/image';
import Link from 'next/link';

import { KIND_DICT } from '@/modules/media-catalog/media.constants';
import type { FeedItem } from '@/modules/timeline/view-timeline/feed.types';
import { FeedSkeleton } from '@/modules/timeline/view-timeline/home-page-skeleton';
import { getUserFeedQueryOptions } from '@/modules/timeline/view-timeline/use-user-feed';
import { AddToWatchlistButton } from '@/modules/watchlist/add-to-watchlist/add-to-watchlist-button';
import SignInButton from '@/shared/components/sign-in-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { formatRuntime } from '@/shared/utilities/format-runtime';
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
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex justify-center px-4 pt-10">
      <div className="space-y-2 text-balance text-center">
        <p>¡Inicia sesión para calificar películas y seguir a tus amigos!</p>
        <SignInButton />
      </div>
    </div>
  );
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

  if (!flatItems || flatItems.length === 0) {
    return (
      <div>
        <div className="absolute inset-0 z-0 bg-radial from-primary to-background opacity-10" />
        <div className="relative z-20 flex flex-col items-center gap-y-2 px-4 py-10">
          <Clapperboard className="size-12 text-primary" />
          <p className="text-center font-bold text-xl">
            Tu feed está un poco vacío
          </p>
          <p className="text-center text-muted-foreground text-sm">
            Sigue a tus amigos para ver sus calificaciones o empieza a puntuar
            películas para recibir recomendaciones.
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
          <FeedItemCard item={item} key={item.feedItemId} />
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
  return (
    <article className="flex gap-3 px-4 py-4 md:gap-4 md:px-10 md:py-5">
      <Link
        aria-label={`Ver el perfil de ${item.actorName}`}
        className="h-fit shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        href={`/profile/${item.actorId}`}
      >
        <Avatar className="size-9 md:size-10">
          <FeedAvatarImage alt={item.actorName} src={item.actorImage} />
          <AvatarFallback>
            {item.actorName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-start gap-2">
          <div className="min-w-0 flex-1 text-sm leading-snug">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
              <Link
                className="truncate font-semibold hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href={`/profile/${item.actorId}`}
              >
                {item.actorName}
              </Link>
              {item.actorUsername ? (
                <span className="truncate text-muted-foreground text-xs md:text-sm">
                  @
                  {item.actorUsername.startsWith('@')
                    ? item.actorUsername.slice(1)
                    : item.actorUsername}
                </span>
              ) : null}
              <span className="text-subtle-foreground">·</span>
              <span className="shrink-0 text-subtle-foreground text-xs md:text-sm">
                {formatFeedItemTime(item.occurredAt)}
              </span>
            </div>
            <p className="text-muted-foreground text-xs md:text-sm">calificó</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Más opciones"
                className="-mr-2 -mt-2 shrink-0 text-muted-foreground"
                size="icon"
                variant="ghost"
              >
                <MoreHorizontal className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <AddToWatchlistButton
                kind={item.kind}
                presentation="menu-item"
                tmdbId={item.movieTmdbId}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-3 flex min-w-0 gap-3 md:gap-4">
          <Link
            className="relative aspect-[2/3] w-24 shrink-0 overflow-hidden rounded-xs bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:w-28"
            href={`/media/${item.kind}/${item.movieTmdbId}`}
          >
            {item.moviePoster ? (
              <Image
                alt={item.movieTitle}
                className="object-cover"
                fill
                sizes="(min-width: 768px) 112px, 96px"
                src={`https://image.tmdb.org/t/p/w342${item.moviePoster}`}
                unoptimized
              />
            ) : null}
          </Link>

          <div className="min-w-0 flex-1 py-0.5">
            <Link
              className="focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href={`/media/${item.kind}/${item.movieTmdbId}`}
            >
              <h2 className="text-pretty font-semibold leading-snug md:text-lg">
                {item.movieTitle}
              </h2>
            </Link>
            <p className="mt-1 text-muted-foreground text-xs leading-snug md:text-sm">
              {item.movieYear} · {KIND_DICT[item.kind]}
            </p>
            {item.movieRuntimeMinutes ? (
              <p className="mt-1 text-subtle-foreground text-xs leading-snug">
                {formatRuntime(item.movieRuntimeMinutes)}
              </p>
            ) : null}
            <p className="mt-4 font-semibold text-primary text-2xl leading-none tabular-nums md:text-3xl">
              {item.score}
              <span className="text-base md:text-lg">/10</span>
            </p>
          </div>
        </div>

        <TimelineTrustedContext item={item} />
      </div>
    </article>
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
    <div className="mt-4 flex items-center gap-2">
      <div aria-hidden="true" className="flex shrink-0 -space-x-2">
        {context.otherPreviewRaters.map((rater) => (
          <Avatar
            className="size-7 border-2 border-background"
            key={rater.userId}
          >
            {rater.avatarUrl ? (
              <AvatarImage alt="" src={rater.avatarUrl} />
            ) : null}
            <AvatarFallback className="text-[10px]">
              {rater.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <p className="min-w-0 text-muted-foreground text-xs leading-snug md:text-sm">
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
    sizes: '(min-width: 768px) 40px, 36px',
    src,
    width: 40,
  });

  return <AvatarImage {...props} />;
}
