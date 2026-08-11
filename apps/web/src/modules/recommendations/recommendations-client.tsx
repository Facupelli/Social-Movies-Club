'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { KIND_DICT } from '@/modules/media-catalog/media.constants';
import type {
  RecommendationItem,
  TrustedRatingContext,
} from '@/modules/recommendations/recommendations.types';
import { getUserRecommendationsQueryOptions } from '@/modules/recommendations/use-user-recommendations';
import SignInButton from '@/shared/components/sign-in-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { formatRuntime } from '@/shared/utilities/format-runtime';
import { RecommendationsSkeleton } from './recommendations-skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { AddToWatchlistButton } from '../watchlist/add-to-watchlist/add-to-watchlist-button';

const VISIBLE_RATERS_COUNT = 3;

export function RecommendationsClient({
  viewerUserId,
}: {
  viewerUserId?: string;
}) {
  if (!viewerUserId) {
    return <SignedOutRecommendations />;
  }

  return <Recommendations viewerUserId={viewerUserId} />;
}

function SignedOutRecommendations() {
  return (
    <div className="flex justify-center px-4 py-12">
      <div className="space-y-2 text-balance text-center">
        <p className="font-semibold text-lg">Recomendaciones para vos</p>
        <p className="text-muted-foreground text-sm">
          Iniciá sesión para descubrir qué ver según las calificaciones de la
          gente que seguís.
        </p>
        <SignInButton />
      </div>
    </div>
  );
}

function Recommendations({ viewerUserId }: { viewerUserId: string }) {
  const {
    data,
    isError,
    isFetchingNextPage,
    isPending,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery(getUserRecommendationsQueryOptions(viewerUserId));

  if (isPending) {
    return <RecommendationsSkeleton />;
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-md space-y-3 px-4 py-12 text-center">
        <p className="font-semibold">No pudimos cargar tus recomendaciones</p>
        <p className="text-muted-foreground text-sm">
          Revisá tu conexión e intentá nuevamente.
        </p>
        <Button onClick={() => refetch()} type="button" variant="secondary">
          Reintentar
        </Button>
      </div>
    );
  }

  const items = data.pages.flatMap((page) => page.items);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="font-semibold text-lg">Todavía no hay recomendaciones</p>
        <p className="mt-2 text-muted-foreground text-sm">
          Cuando la gente que seguís califique películas o series, sus mejores
          hallazgos van a aparecer acá.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/users">
              <UserPlus className="size-4" />
              Encontrá gente para seguir
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="divide-y divide-border">
        {items.map((item) => (
          <RecommendationCard item={item} key={item.movieId} />
        ))}
      </div>

      {hasNextPage ? (
        <div className="flex justify-center px-4 py-5">
          <Button
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
            type="button"
          >
            {isFetchingNextPage ? 'Cargando más...' : 'Cargar más'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function RecommendationCard({ item }: { item: RecommendationItem }) {
  const href = `/media/${item.kind}/${item.movieTmdbId}`;

  return (
    <article className="flex gap-3 px-4 py-5 first:pt-4 md:gap-5 md:px-10 md:py-7">
      <Link
        aria-label={`Ver ${item.movieTitle}`}
        className="relative aspect-[2/3] w-30 shrink-0 self-start overflow-hidden rounded-xs bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:w-36"
        href={href}
      >
        {item.moviePoster ? (
          <Image
            alt={item.movieTitle}
            className="object-cover"
            fill
            sizes="(min-width: 768px) 144px, 128px"
            src={`https://image.tmdb.org/t/p/w342${item.moviePoster}`}
            unoptimized
          />
        ) : null}
      </Link>

      <div className="min-w-0 flex-1 flex flex-col">
        <div className="flex justify-between">
          <Link
            className="focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href={href}
          >
            <h2 className="text-pretty font-semibold md:text-lg leading-snug">
              {item.movieTitle}
            </h2>
          </Link>

          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Más opciones"
                  className="-mr-2 -mt-2 shrink-0 text-muted-foreground"
                  size="icon"
                  variant="ghost"
                >
                  <MoreHorizontal className="size-4" />
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
        <p className="mt-1 text-muted-foreground text-xs leading-snug md:text-base">
          {item.movieYear ? `${item.movieYear} · ` : ''}
          {KIND_DICT[item.kind]}
        </p>
        {item.movieRuntimeMinutes ? (
          <p className="mt-1 text-subtle-foreground text-xs leading-snug md:text-sm">
            {formatRuntime(item.movieRuntimeMinutes)}
          </p>
        ) : null}

        <RecommendationRatingContext item={item} />
      </div>
    </article>
  );
}

function RecommendationRatingContext({ item }: { item: RecommendationItem }) {
  const visibleRaters = item.trustedRatingContext.slice(
    0,
    VISIBLE_RATERS_COUNT
  );
  const remainingCount = Math.max(
    0,
    item.trustedRatingContext.length - VISIBLE_RATERS_COUNT
  );

  return (
    <div className="mt-auto pt-2">
      <fieldset
        aria-label={`${item.ratingCount} calificaciones de personas que seguís`}
        className="flex items-center gap-3 border-0 p-0"
      >
        <div aria-hidden="true" className="flex shrink-0 gap-2">
          {visibleRaters.map((rater) => (
            <RaterAvatar key={rater.userId} rater={rater} />
          ))}
          {remainingCount > 0 ? (
            <div className="relative flex size-12 items-center justify-center rounded-full border-2 border-surface bg-muted font-semibold text-primary text-lg tabular-nums md:size-14">
              +{remainingCount}
            </div>
          ) : null}
        </div>
      </fieldset>
      <p className="mt-2 text-muted-foreground text-xs leading-snug md:text-sm">
        <strong className="font-semibold text-primary">
          {item.supporterCount} personas
        </strong>{' '}
        la recomiendan
        <br />
        promedio{' '}
        <strong className="font-semibold text-primary tabular-nums">
          {item.averageScore.toFixed(1)}
        </strong>
      </p>
    </div>
  );
}

function RaterAvatar({ rater }: { rater: TrustedRatingContext }) {
  return (
    <div className="relative">
      <Avatar className="size-10 border-2 border-surface md:size-14">
        {rater.avatarUrl ? <AvatarImage alt="" src={rater.avatarUrl} /> : null}
        <AvatarFallback className="text-sm">
          {rater.displayName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="absolute -right-1 -bottom-0.5 flex size-5 items-center justify-center rounded-full bg-primary-subtle font-semibold text-primary text-xs tabular-nums md:size-6">
        {rater.score}
      </span>
    </div>
  );
}
