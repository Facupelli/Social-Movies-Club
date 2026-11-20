import 'server-only';

import { findStreamingPreferencesBase } from '@/modules/account/streaming-preferences/streaming-preferences.pg';
import { dbWatchlistMovieToView } from '@/modules/media-catalog/get-media-details/media.adapters';
import type {
  WatchlistItem,
  WatchlistRow,
} from '@/modules/watchlist/watchlist.types';
import {
  getProfileWatchlist,
  getProfileWatchlistOnSubscriptions,
} from './watchlist.pg';

export async function getWatchlist({
  ownerId,
  viewerId,
  filterRequested,
}: {
  ownerId: string;
  viewerId: string | undefined;
  filterRequested: boolean;
}) {
  const preferences = viewerId
    ? await findStreamingPreferencesBase(viewerId)
    : null;
  const providerIds = preferences?.selectedProviders.map(({ id }) => id) ?? [];
  const [firstProvider, ...otherProviders] = providerIds;
  const filter =
    preferences?.countryCode && firstProvider
      ? {
          countryCode: preferences.countryCode,
          providerIds: [firstProvider, ...otherProviders] as const,
        }
      : null;
  const filtered =
    filterRequested && filter
      ? await getProfileWatchlistOnSubscriptions(ownerId, filter)
      : null;
  const rows = filtered?.rows ?? (await getProfileWatchlist(ownerId));

  return {
    items: rows.map(toWatchlistItem),
    totalCount: filtered?.totalCount ?? rows.length,
    unknownCount: filtered?.unknownCount ?? 0,
    filterActive: filtered !== null,
    canFilter: filter !== null,
  };
}

function toWatchlistItem(row: WatchlistRow): WatchlistItem {
  return {
    mediaId: row.movieId,
    addedAt:
      row.addedAt instanceof Date
        ? row.addedAt.toISOString()
        : new Date(row.addedAt).toISOString(),
    movie: dbWatchlistMovieToView(row),
  };
}
