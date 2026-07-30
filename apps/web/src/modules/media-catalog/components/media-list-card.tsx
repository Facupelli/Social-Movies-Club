'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MediaKindDict } from '@/modules/media-catalog/media.type';
import type { MovieView } from '@/modules/media-catalog/movie-view';
import { RateDialog } from '@/modules/ratings/rate-media/rate-dialog';
import type { TrustedRatingSummary } from '@/modules/trusted-rating-context/trusted-rating-context.types';
import { AddToWatchlistButton } from '@/modules/watchlist/add-to-watchlist/add-to-watchlist-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Skeleton } from '@/shared/ui/skeleton';

export function MediaListCard({
  isTrustedRatingLoading = false,
  movie,
  onRatingSaved,
  trustedRating,
}: {
  isTrustedRatingLoading?: boolean;
  movie: MovieView;
  onRatingSaved?: () => void;
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
              onRatingSaved={onRatingSaved}
              posterPath={movie.posterPath}
              title={movie.title}
              tmdbId={movie.tmdbId}
              triggerClassName="size-10 px-0"
              year={movie.year}
            />
          </div>
        </div>

        <TrustedRating
          isLoading={isTrustedRatingLoading}
          summary={trustedRating}
        />
      </div>
    </article>
  );
}

function TrustedRating({
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
          <Avatar
            className="size-7 border-2 border-card sm:size-8"
            key={rater.userId}
          >
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
