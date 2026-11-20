'use client';

import { type ReactNode, useState } from 'react';
import { MediaListCard } from '@/modules/media-catalog/components/media-list-card';
import { getMediaIdentityKey } from '@/modules/media-catalog/media-identity';
import type { EnrichedWatchlistItem } from '@/modules/watchlist/watchlist.types';

export function WatchlistItemsGrid({
  initialItems,
  isOwner,
  sort,
  filter,
  filteredTotal,
  hasUnknownAvailability,
}: {
  initialItems: EnrichedWatchlistItem[];
  isOwner: boolean;
  sort: ReactNode;
  filter: ReactNode;
  filteredTotal: number | undefined;
  hasUnknownAvailability: boolean;
}) {
  const [removedMediaIds, setRemovedMediaIds] = useState<Set<string>>(
    () => new Set()
  );
  const items = initialItems.filter(
    ({ mediaId }) => !removedMediaIds.has(mediaId)
  );

  const total =
    filteredTotal === undefined
      ? undefined
      : filteredTotal - (initialItems.length - items.length);

  if (items.length === 0 && (total === undefined || total === 0)) {
    return (
      <p className="text-muted-foreground text-sm">
        Tu lista está vacía. Guardá títulos que quieras ver más adelante.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <output className="shrink-0 text-muted-foreground text-sm tabular-nums">
            {total === undefined
              ? `${items.length} ${items.length === 1 ? 'título' : 'títulos'}`
              : `${items.length} de ${total} ${total === 1 ? 'título' : 'títulos'}`}
          </output>
          {sort}
        </div>
        {filter && <div>{filter}</div>}
        {hasUnknownAvailability && (
          <p className="pt-1 text-pretty text-muted-foreground text-[0.6875rem]/4">
            Algunos títulos pueden faltar porque todavía no conocemos su
            disponibilidad.
          </p>
        )}
      </div>
      {items.length === 0 && (
        <p className="text-sm text-foreground">
          No encontramos títulos en tus plataformas.
        </p>
      )}
      <div className="space-y-3">
        {items.map(({ mediaId, movie, trustedRating }) => (
          <MediaListCard
            key={`${getMediaIdentityKey(movie.tmdbId, movie.kind)}-${mediaId}`}
            movie={movie}
            onRatingSaved={
              isOwner
                ? () => {
                    setRemovedMediaIds((current) => {
                      const next = new Set(current);
                      next.add(mediaId);
                      return next;
                    });
                  }
                : undefined
            }
            trustedRating={trustedRating}
          />
        ))}
      </div>
    </>
  );
}
