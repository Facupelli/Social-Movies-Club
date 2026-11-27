'use client';

import Image from 'next/image';
import Link from 'next/link';
import { TrustedRating } from '@/modules/media-catalog/components/media-list-card';
import { MediaKindDict } from '@/modules/media-catalog/media.type';
import type { MovieView } from '@/modules/media-catalog/movie-view';
import { RateDialog } from '@/modules/ratings/rate-media/rate-dialog';
import type { TrustedRatingSummary } from '@/modules/trusted-rating-context/trusted-rating-context.types';
import { AddToWatchlistButton } from '@/modules/watchlist/add-to-watchlist/add-to-watchlist-button';
import { formatRuntime } from '@/shared/utilities/format-runtime';
import {
  WATCHLIST_CARD_CLASS_NAME,
  WATCHLIST_CARD_POSTER_CLASS_NAME,
} from './watchlist-card.styles';

const ACTION_CLASS_NAME = 'size-11 p-0 has-[>svg]:px-0';

export function WatchlistCard({
  movie,
  onRatingSaved,
  trustedRating,
}: {
  movie: MovieView;
  onRatingSaved?: () => void;
  trustedRating: TrustedRatingSummary;
}) {
  const href = `/media/${movie.kind}/${movie.tmdbId}`;

  return (
    <article className={WATCHLIST_CARD_CLASS_NAME}>
      <Link
        aria-label={movie.title}
        className={`${WATCHLIST_CARD_POSTER_CLASS_NAME} bg-muted focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2`}
        href={href}
      >
        {movie.posterPath ? (
          <Image
            alt=""
            className="object-cover"
            fill
            sizes="(max-width: 639px) 88px, 112px"
            src={`https://image.tmdb.org/t/p/w342${movie.posterPath}`}
            unoptimized
          />
        ) : (
          <span className="grid size-full place-items-center px-2 text-center text-muted-foreground text-xs">
            Sin póster
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-col px-2 pt-2">
        <Link
          className="w-fit max-w-full rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-ring"
          href={href}
        >
          <h2 className="line-clamp-2 wrap-anywhere font-semibold text-sm leading-tight">
            {movie.title}
          </h2>
        </Link>
        <p className="text-muted-foreground text-xs">
          {[
            movie.year,
            MediaKindDict[movie.kind],
            movie.runtime ? formatRuntime(movie.runtime) : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
        {movie.overview && (
          <p className="hidden text-subtle-foreground text-xs sm:line-clamp-2">
            {movie.overview}
          </p>
        )}
        <TrustedRating
          className="mt-1 border-0 pt-0 sm:mt-1 sm:pt-0"
          summary={trustedRating}
        />
        <div className="mt-auto flex items-start justify-end gap-1 [&>form]:min-w-0">
          <AddToWatchlistButton
            className={ACTION_CLASS_NAME}
            kind={movie.kind}
            tmdbId={movie.tmdbId}
            variant="ghost"
          />
          <RateDialog
            kind={movie.kind}
            onRatingSaved={onRatingSaved}
            posterPath={movie.posterPath}
            publicationMode="publish"
            recommendationCache="invalidate"
            title={movie.title}
            tmdbId={movie.tmdbId}
            triggerClassName={ACTION_CLASS_NAME}
            triggerVariant="ghost"
            year={movie.year}
          />
        </div>
      </div>
    </article>
  );
}
