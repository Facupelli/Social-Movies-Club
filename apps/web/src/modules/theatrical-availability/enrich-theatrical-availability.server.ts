import 'server-only';

import { debuglog } from 'node:util';
import { after } from 'next/server';
import { findAccountCountry } from '@/modules/account/current-account-profile';
import type { MediaKind } from '@/modules/media-catalog/media.type';
import { TmdbRepository } from '@/platform/tmdb/tmdb.repository';
import { isIsoCountryCode } from '@/shared/utilities/iso-country-code';
import type { TheatricalAvailability } from './theatrical-availability.types';

const log = debuglog('queves-theatrical');
const tmdb = new TmdbRepository();
const refreshes = new Map<string, Promise<void>>();

type FeedMedia = {
  kind: MediaKind;
  movieTmdbId: number;
  theatricalAvailability?: TheatricalAvailability;
};

async function refreshSnapshot(country: string): Promise<void> {
  const startedAt = performance.now();
  try {
    if ((await tmdb.readNowPlayingMovieIds(country)) !== null) {
      return;
    }
    const ids = await tmdb.refreshNowPlayingMovieIds(country);
    log(
      'Refreshed %s: %d movies in %d ms',
      country,
      ids.length,
      Math.round(performance.now() - startedAt)
    );
  } catch (error) {
    log(
      'Refresh failed for %s after %d ms: %s',
      country,
      Math.round(performance.now() - startedAt),
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

function scheduleRefresh(country: string): void {
  after(async () => {
    const inFlight = refreshes.get(country);
    if (inFlight) {
      await inFlight;
      return;
    }

    const refresh = refreshSnapshot(country);
    refreshes.set(country, refresh);
    try {
      await refresh;
    } finally {
      refreshes.delete(country);
    }
  });
}

export async function enrichTheatricalAvailability<T extends FeedMedia>(
  userId: string,
  items: T[]
): Promise<T[]> {
  if (
    process.env.CACHE_BACKEND === 'none' ||
    !items.some((item) => item.kind === 'movie')
  ) {
    return items;
  }

  try {
    const country = await findAccountCountry(userId);
    if (!(country && isIsoCountryCode(country))) {
      return items;
    }

    const cached = await tmdb.readNowPlayingMovieIds(country);
    if (cached === null) {
      scheduleRefresh(country);
      return items;
    }
    if (cached.length === 0) {
      return items;
    }

    const movieIds = new Set(cached);
    return items.map((item) =>
      item.kind === 'movie' && movieIds.has(item.movieTmdbId)
        ? { ...item, theatricalAvailability: 'now_playing' }
        : item
    );
  } catch {
    return items;
  }
}
