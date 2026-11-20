'use client';

import Image from 'next/image';
import { type ReactNode, useState } from 'react';
import {
  useMediaWatchProviders,
  WatchAvailabilityRefreshingError,
} from '@/modules/media-catalog/get-watch-providers/use-media-watch-providers';
import type { MediaKind } from '@/modules/media-catalog/media.type';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';

type MediaIdentity = {
  tmdbId: number;
  kind: MediaKind;
};

export function MovieWatchProviders(identity: MediaIdentity) {
  const [requested, setRequested] = useState(false);
  return (
    <WatchProvidersSection
      {...identity}
      enabled={requested}
      heading={
        <Button
          className="h-auto p-0"
          onClick={() => setRequested(true)}
          variant="link"
        >
          ¿Dónde ver?
        </Button>
      }
    />
  );
}

export function DetailWatchProviders(identity: MediaIdentity) {
  return (
    <WatchProvidersSection
      {...identity}
      enabled
      heading={<h2 className="font-semibold text-sm">Dónde ver</h2>}
    />
  );
}

function JustWatchAttribution({ link }: { link?: string | null }) {
  const logo = (
    <Image
      alt="JustWatch"
      className="h-auto"
      height={10}
      src="https://widget.justwatch.com/assets/JW_logo_color_10px.svg"
      width={68}
    />
  );
  return (
    <div className="flex items-center gap-2 text-muted-foreground text-xs">
      <span>by</span>
      {link ? (
        <a
          className="shrink-0 transition-opacity hover:opacity-80"
          href={link}
          rel="noopener noreferrer"
          target="_blank"
        >
          {logo}
        </a>
      ) : (
        logo
      )}
    </div>
  );
}

function WatchProvidersSection({
  tmdbId,
  kind,
  enabled,
  heading,
}: MediaIdentity & { enabled: boolean; heading: ReactNode }) {
  const { data, error, isFetching, isPending, refetch } =
    useMediaWatchProviders(tmdbId, kind, enabled);
  const providers = data?.offers.filter(
    (offer) => offer.monetizationType === 'flatrate'
  );

  return (
    <div className="md:space-y-2">
      <div className="flex flex-wrap items-center gap-x-2">
        {heading}
        <JustWatchAttribution link={enabled ? data?.link : undefined} />
      </div>

      {enabled && (
        <div aria-live="polite">
          {isPending && (
            <div className="flex flex-wrap gap-1 py-1">
              <span className="sr-only">Buscando plataformas…</span>
              {['first', 'second', 'third'].map((slot) => (
                <Skeleton
                  aria-hidden="true"
                  className="size-[30px] rounded-sm"
                  key={slot}
                />
              ))}
            </div>
          )}

          {data &&
            (providers?.length ? (
              <div className="flex flex-wrap items-center gap-1 py-1">
                {providers.map((provider) =>
                  provider.logoPath ? (
                    <Image
                      alt={provider.name}
                      className="h-auto rounded-sm"
                      height={30}
                      key={provider.tmdbProviderId}
                      src={`https://image.tmdb.org/t/p/original${provider.logoPath}`}
                      unoptimized
                      width={30}
                    />
                  ) : (
                    <span
                      className="text-muted-foreground text-xs"
                      key={provider.tmdbProviderId}
                    >
                      {provider.name}
                    </span>
                  )
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">
                No está disponible en plataformas de suscripción.
              </p>
            ))}

          {error && (
            <div className="flex flex-wrap items-center gap-x-2 text-muted-foreground text-xs">
              <p>
                {error instanceof WatchAvailabilityRefreshingError
                  ? 'La disponibilidad se está actualizando.'
                  : 'No pudimos cargar las plataformas.'}
              </p>
              <Button
                className="min-h-10 px-0 text-xs"
                disabled={isFetching}
                onClick={() => refetch()}
                variant="link"
              >
                Reintentar
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
