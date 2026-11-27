'use client';

import Link from 'next/link';
import { useState } from 'react';
import type {
  EnrichedWatchlistItem,
  WatchlistSort,
} from '@/modules/watchlist/watchlist.types';
import { WatchlistCard } from './watchlist-card';
import { WatchlistProviderFilter } from './watchlist-provider-filter';
import { WatchlistSortControl } from './watchlist-sort-control';

export function WatchlistItemsGrid({
  initialItems,
  isOwner,
  activeSort,
  canFilter,
  filterActive,
  showControls,
  socialSortingAvailable,
  filteredTotal,
  hasUnknownAvailability,
}: {
  initialItems: EnrichedWatchlistItem[];
  isOwner: boolean;
  activeSort: WatchlistSort;
  canFilter: boolean;
  filterActive: boolean;
  showControls: boolean;
  socialSortingAvailable: boolean;
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
          {showControls && (
            <WatchlistSortControl
              socialSortingAvailable={socialSortingAvailable}
              value={activeSort}
            />
          )}
        </div>
        {showControls && (
          <div>
            {canFilter ? (
              <WatchlistProviderFilter active={filterActive} />
            ) : (
              <p className="text-pretty text-muted-foreground text-sm">
                Filtrá tu lista por las plataformas que usás.{' '}
                <Link
                  className="rounded-sm font-medium text-foreground underline decoration-muted-foreground underline-offset-4 hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  href="/settings/streaming"
                >
                  Configurar plataformas
                </Link>
              </p>
            )}
          </div>
        )}
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
          <WatchlistCard
            key={mediaId}
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
