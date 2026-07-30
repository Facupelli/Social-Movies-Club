'use client';

import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import type { MediaKind } from '@/modules/media-catalog/media.type';
import { getMediaIdentityKey } from '@/modules/media-catalog/media-identity';
import { getUserRatingsQueryOptions } from '@/modules/ratings/get-rating-status/use-user-ratings';
import type { ViewerMediaRating } from './viewer-rating-for-media.types';

export function ViewerRatingSection({
  initialRating,
  initialRatingFailed,
  kind,
  tmdbId,
  viewerUserId,
}: {
  initialRating: ViewerMediaRating | null;
  initialRatingFailed: boolean;
  kind: MediaKind;
  tmdbId: number;
  viewerUserId: string;
}) {
  const ratingQuery = useQuery(getUserRatingsQueryOptions(viewerUserId));
  const cachedRating =
    ratingQuery.data?.[getMediaIdentityKey(tmdbId, kind)] ?? null;
  const rating = cachedRating?.isRated ? cachedRating : initialRating;
  const failed = !rating && initialRatingFailed && ratingQuery.isError;

  return (
    <section
      aria-labelledby="viewer-rating-heading"
      className="space-y-2 rounded-md border border-border p-3"
    >
      <h2 className="text-sm font-semibold" id="viewer-rating-heading">
        Tu calificación
      </h2>
      {failed ? (
        <p className="text-sm text-muted-foreground">
          No pudimos cargar tu calificación.
        </p>
      ) : null}
      {!failed && rating ? (
        <div className="flex items-center justify-between gap-3 py-1">
          <div className="flex items-center gap-1.5 text-primary">
            <Star aria-hidden="true" className="size-6" />
            <strong className="text-2xl tabular-nums">{rating.score}/10</strong>
          </div>
          <p className="text-right text-xs text-muted-foreground">
            Vista el {formatDate(rating.watchedDate)}
          </p>
        </div>
      ) : null}
      {failed || rating ? null : (
        <p className="text-sm text-muted-foreground">
          Todavía no calificaste este título.
        </p>
      )}
    </section>
  );
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
    .format(new Date(`${date}T00:00:00Z`))
    .replaceAll('.', '');
}
