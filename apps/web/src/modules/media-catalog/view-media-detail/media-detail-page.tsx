import { Film } from 'lucide-react';
import Image from 'next/image';
import { MovieWatchProviders } from '@/modules/media-catalog/get-watch-providers/movie-watch-providers';
import type { TMDbMediaMultiSearch } from '@/modules/media-catalog/media.type';
import { MediaKindDict } from '@/modules/media-catalog/media.type';
import type { ViewerMediaRating } from '@/modules/ratings/get-viewer-rating-for-media/viewer-rating-for-media.types';
import { ViewerRatingSection } from '@/modules/ratings/get-viewer-rating-for-media/viewer-rating-section';
import { RateDialog } from '@/modules/ratings/rate-media/rate-dialog';
import { TrustedRatingDetailsSection } from '@/modules/trusted-rating-context/components/trusted-rating-details';
import type { TrustedRatingDetails } from '@/modules/trusted-rating-context/trusted-rating-context.types';
import { AddToWatchlistButton } from '@/modules/watchlist/add-to-watchlist/add-to-watchlist-button';
import { Badge } from '@/shared/ui/badge';

export function MediaDetailPage({
  media,
  trustedDetails,
  trustedContextFailed,
  viewerRating,
  viewerRatingFailed,
  isAuthenticated,
  viewerUserId,
}: {
  media: TMDbMediaMultiSearch;
  trustedDetails: TrustedRatingDetails | null;
  trustedContextFailed: boolean;
  viewerRating: ViewerMediaRating | null;
  viewerRatingFailed: boolean;
  isAuthenticated: boolean;
  viewerUserId: string | null;
}) {
  return (
    <main className="pb-10">
      <header className="relative overflow-hidden border-border border-b">
        <div className="absolute inset-0">
          {media.backdropPath ? (
            <Image
              alt=""
              className="object-cover opacity-25"
              fill
              priority
              sizes="(min-width: 1024px) 780px, 100vw"
              src={`https://image.tmdb.org/t/p/original${media.backdropPath}`}
              unoptimized
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-surface/70 to-surface" />
        </div>

        <div className="relative grid grid-cols-[112px_minmax(0,1fr)] gap-4 px-4 pt-8 pb-6 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6 md:px-8">
          <div className="relative aspect-[2/3] overflow-hidden rounded-md border border-border bg-muted">
            {media.posterPath ? (
              <Image
                alt={`Póster de ${media.title}`}
                className="object-cover"
                fill
                priority
                sizes="(min-width: 640px) 160px, 112px"
                src={`https://image.tmdb.org/t/p/w500${media.posterPath}`}
                unoptimized
              />
            ) : (
              <div className="grid size-full place-items-center text-muted-foreground">
                <Film className="size-9" />
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col justify-end gap-3">
            <Badge className="w-fit" variant="secondary">
              {MediaKindDict[media.kind]}
            </Badge>
            <div>
              <h1 className="text-pretty text-2xl font-bold leading-tight sm:text-3xl">
                {media.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {[media.year, media.runtime ? `${media.runtime} min` : null]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
            <div className="flex max-w-52 gap-2">
              <div className="flex-1">
                <AddToWatchlistButton kind={media.kind} tmdbId={media.id} />
              </div>
              <div className="flex-1">
                <RateDialog
                  kind={media.kind}
                  posterPath={media.posterPath}
                  title={media.title}
                  tmdbId={media.id}
                  year={media.year}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-8 px-4 py-8 md:px-8">
        {isAuthenticated ? (
          <>
            {trustedContextFailed ? (
              <section
                aria-labelledby="trusted-error-heading"
                className="space-y-2"
              >
                <h2
                  className="text-xl font-semibold"
                  id="trusted-error-heading"
                >
                  De personas que seguís
                </h2>
                <p className="text-sm text-muted-foreground">
                  No pudimos cargar estas calificaciones. Intentá nuevamente más
                  tarde.
                </p>
              </section>
            ) : null}
            {!trustedContextFailed && trustedDetails ? (
              <TrustedRatingDetailsSection details={trustedDetails} />
            ) : null}

            {viewerUserId ? (
              <ViewerRatingSection
                initialRating={viewerRating}
                initialRatingFailed={viewerRatingFailed}
                kind={media.kind}
                tmdbId={media.id}
                viewerUserId={viewerUserId}
              />
            ) : null}
          </>
        ) : null}

        <section aria-labelledby="synopsis-heading" className="space-y-3">
          <h2 className="text-xl font-semibold" id="synopsis-heading">
            Sinopsis
          </h2>
          <p className="text-pretty leading-relaxed text-muted-foreground">
            {media.overview || 'No hay una sinopsis disponible.'}
          </p>
        </section>

        <MovieWatchProviders kind={media.kind} tmdbId={media.id} />
      </div>
    </main>
  );
}
