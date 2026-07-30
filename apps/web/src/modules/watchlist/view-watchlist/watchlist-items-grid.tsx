'use client';

import { useState, type ReactNode } from 'react';
import { MediaListCard } from '@/modules/media-catalog/components/media-list-card';
import { getMediaIdentityKey } from '@/modules/media-catalog/media-identity';
import type { EnrichedWatchlistItem } from '@/modules/watchlist/watchlist.types';

export function WatchlistItemsGrid({
  initialItems,
  isOwner,
  controls,
}: {
  initialItems: EnrichedWatchlistItem[];
  isOwner: boolean;
  controls: ReactNode;
}) {
  const [items, setItems] = useState(initialItems);

  if (items.length === 0) {
    return (
      <p className="py-6 text-sm text-muted-foreground">
        Tu lista está vacía. Guardá títulos que quieras ver más adelante.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {items.length} {items.length === 1 ? 'título' : 'títulos'}
        </p>
        {controls}
      </div>
      <div className="space-y-3">
        {items.map(({ mediaId, movie, trustedRating }) => (
          <MediaListCard
            key={`${getMediaIdentityKey(movie.tmdbId, movie.kind)}-${mediaId}`}
            movie={movie}
            onRatingSaved={
              isOwner
                ? () => {
                    setItems((current) =>
                      current.filter((item) => item.mediaId !== mediaId)
                    );
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
