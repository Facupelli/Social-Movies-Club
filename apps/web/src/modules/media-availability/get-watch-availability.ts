import 'server-only';

import { getMediaByTmdbIdentity } from '@/modules/media-catalog/get-media-details/media.pg';
import type { MediaKind } from '@/modules/media-catalog/media.type';
import { TmdbService } from '@/platform/tmdb/tmdb.service';
import type { TmdbMediaAvailabilitySnapshot } from '@/platform/tmdb/types/streaming';
import { getMediaAvailabilityForCountry } from './media-availability.pg';
import type { WatchAvailability } from './media-availability.types';
import { refreshMediaAvailabilityByTmdbIdentity } from './refresh-media-availability';

const WATCH_COUNTRY = 'AR';
const tmdb = new TmdbService();

type OffersAndLink = Pick<WatchAvailability, 'offers' | 'link'>;

function getAttributionLink(link: string | null | undefined): string | null {
  if (!link) {
    return null;
  }
  try {
    const url = new URL(link);
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

function toWatchAvailability(
  fetchedAt: string,
  region?: OffersAndLink | null
): WatchAvailability {
  return {
    fetchedAt,
    link: getAttributionLink(region?.link),
    offers: (region?.offers ?? []).map(
      ({ tmdbProviderId, name, logoPath, monetizationType }) => ({
        tmdbProviderId,
        name,
        logoPath,
        monetizationType,
      })
    ),
  };
}

function fromTmdb(snapshot: TmdbMediaAvailabilitySnapshot): WatchAvailability {
  const region = snapshot.countries.find(
    ({ countryCode }) => countryCode === WATCH_COUNTRY
  );
  return toWatchAvailability(snapshot.fetchedAt, region);
}

async function readSnapshot(mediaId: string) {
  return await getMediaAvailabilityForCountry(mediaId, WATCH_COUNTRY).catch(
    () => null
  );
}

function fromPostgres(snapshot: Awaited<ReturnType<typeof readSnapshot>>) {
  if (!snapshot?.fetchedAt) {
    return null;
  }
  return toWatchAvailability(snapshot.fetchedAt.toISOString(), {
    link: snapshot.link,
    offers: snapshot.offers.map(({ providerName, ...offer }) => ({
      ...offer,
      name: providerName,
    })),
  });
}

export async function getWatchAvailability(
  tmdbId: number,
  kind: MediaKind
): Promise<WatchAvailability | null> {
  const media = await getMediaByTmdbIdentity(tmdbId, kind).catch(() => null);
  if (!media) {
    return fromTmdb(await tmdb.getMediaWatchProviders(tmdbId, kind));
  }

  const snapshot = await readSnapshot(media.id);
  if (!snapshot) {
    return fromTmdb(await tmdb.getMediaWatchProviders(tmdbId, kind));
  }
  if (snapshot.state === 'fresh') {
    return fromPostgres(snapshot);
  }

  const refreshed = await refreshMediaAvailabilityByTmdbIdentity(
    media.id,
    tmdbId,
    kind
  );
  if (refreshed) {
    return fromTmdb(refreshed);
  }

  const previous = fromPostgres(snapshot);
  if (previous) {
    return previous;
  }

  const latest = await readSnapshot(media.id);
  return latest
    ? fromPostgres(latest)
    : fromTmdb(await tmdb.getMediaWatchProviders(tmdbId, kind));
}
