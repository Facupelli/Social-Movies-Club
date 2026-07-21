import { MovieGrid } from '@/modules/media-catalog/components/movie-grid';
import { Skeleton } from '@/shared/ui/skeleton';

const RATING_SKELETON_COUNT = 6;

export function ProfileRatingsSkeleton() {
  return (
    <section aria-label="Cargando calificaciones" className="pt-2 pb-10">
      <div className="flex h-[68px] items-center justify-between gap-4 overflow-hidden py-4 md:justify-end">
        <div className="flex shrink-0 items-center gap-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-36" />
          <Skeleton className="size-9" />
        </div>
        <Skeleton className="h-9 w-[84px] shrink-0" />
      </div>

      <MovieGrid>
        {Array.from({ length: RATING_SKELETON_COUNT }, (_, index) => (
          <div
            className="overflow-hidden rounded-xs border border-border bg-card"
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton order never changes
            key={index}
          >
            <Skeleton className="aspect-[2/3] w-full rounded-none" />
            <div className="space-y-2 px-4 py-2">
              <Skeleton className="h-5 w-4/5" />
              <div className="flex h-9 items-center justify-between">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="size-7 md:size-9" />
              </div>
            </div>
          </div>
        ))}
      </MovieGrid>
    </section>
  );
}
