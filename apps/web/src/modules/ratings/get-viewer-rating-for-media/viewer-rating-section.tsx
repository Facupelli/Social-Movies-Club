'use client';

import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { getMediaIdentityKey } from '@/modules/media-catalog/media-identity';
import type { MediaKind } from '@/modules/media-catalog/media.type';
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
    <section aria-labelledby="viewer-rating-heading" className="space-y-3">
      <h2 className="text-xl font-semibold" id="viewer-rating-heading">
        Tu calificación
      </h2>
      {failed ? (
        <p className="text-sm text-muted-foreground">
          No pudimos cargar tu calificación.
        </p>
      ) : null}
      {!failed && rating ? (
        <div className="flex items-center justify-between rounded-md bg-muted/50 px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Vista el {formatDate(rating.watchedDate)}
          </p>
          <div className="flex items-center gap-2">
            <Star className="size-5 fill-primary text-primary" />
            <strong className="text-xl tabular-nums">{rating.score}/10</strong>
          </div>
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
