'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useMediaWatchProviders } from '@/modules/media-catalog/get-watch-providers/use-media-watch-providers';
import type { MediaType } from '@/modules/media-catalog/media.type';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';

export function MovieWatchProviders({
  tmdbId,
  type,
}: {
  tmdbId: number;
  type: MediaType;
}) {
  const [requested, setRequested] = useState(false);
  const {
    data: watchProviders,
    isLoading,
    error,
    isFetched,
  } = useMediaWatchProviders(tmdbId, type, requested);

  if (error) {
    return (
      <div className="text-muted-foreground text-xs">
        Error, vas a tener que googlear
      </div>
    );
  }

  const flatRateProviders = watchProviders?.data?.flatrate;
  const hasFlatRateProviders =
    flatRateProviders !== undefined && flatRateProviders.length > 0;

  return (
    <div className="md:space-y-2">
      <div className="flex flex-wrap gap-x-2">
        <Button
          className="h-auto p-0"
          onClick={() => setRequested(true)}
          variant="link"
        >
          Donde ver?
        </Button>

        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <span>by</span>
          <a
            className="inline-flex shrink-0 items-center gap-1 transition-opacity hover:opacity-80"
            href="todo"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image
              alt="JustWatch"
              className="h-auto"
              height={10}
              src="https://widget.justwatch.com/assets/JW_logo_color_10px.svg"
              width={60}
            />
          </a>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-wrap gap-1 py-1">
          {[...Array(3)].map((_, idx) => (
            // biome-ignore lint:reason
            <div key={idx}>
              <Skeleton className="size-[30px] rounded-sm" />
            </div>
          ))}
        </div>
      )}

      {isFetched &&
        (hasFlatRateProviders ? (
          <div className="flex flex-wrap gap-1 py-1">
            {flatRateProviders?.map((provider) => (
              <div key={provider.provider_id}>
                <Image
                  alt={provider.provider_name}
                  className="h-auto rounded-sm"
                  height={30}
                  src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                  unoptimized
                  width={30}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground text-xs">
            No esta en ninguna plataforma :(
          </div>
        ))}
    </div>
  );
}
