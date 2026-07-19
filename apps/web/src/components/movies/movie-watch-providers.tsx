'use client';

import Image from 'next/image';
import { useMediaWatchProviders } from '@/media/hooks/use-media-watch-providers';
import type { MediaType } from '@/media/media.type';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

export function MovieWatchProviders({
  tmdbId,
  type,
}: {
  tmdbId: number;
  type: MediaType;
}) {
  const {
    data: watchProviders,
    isLoading,
    error,
    refetch,
    isEnabled,
    isFetched,
  } = useMediaWatchProviders(tmdbId, type);

  if (error) {
    return (
      <div className="text-muted-foreground text-xs">
        Error, vas a tener que googlear
      </div>
    );
  }

  if (!watchProviders?.data && isEnabled) {
    return (
      <div className="text-muted-foreground text-xs">
        No esta en ninguna plataforma :(
      </div>
    );
  }

  const hasFlatRateProviders =
    watchProviders?.data?.flatrate && watchProviders.data.flatrate.length > 0;

  return (
    <div className="md:space-y-2">
      <div className="flex flex-wrap gap-x-2">
        <Button className="h-auto p-0" onClick={() => refetch()} variant="link">
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
            {watchProviders.data.flatrate?.map((provider) => (
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
