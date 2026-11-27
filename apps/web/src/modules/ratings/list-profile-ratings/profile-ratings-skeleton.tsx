import { MovieGrid } from '@/modules/media-catalog/components/movie-grid';
import { PROFILE_RATINGS_GRID_CLASS_NAME } from '@/modules/ratings/list-profile-ratings/profile-ratings.constants';
import { Skeleton } from '@/shared/ui/skeleton';

const RATING_SKELETON_COUNT = 6;

export function ProfileRatingsSkeleton() {
  return (
    <section aria-label="Cargando calificaciones" className="pt-2 pb-10">
      <div
        aria-hidden="true"
        className="flex items-center justify-between gap-2 py-2 md:justify-end"
      >
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-11 w-21" />
      </div>

      <MovieGrid className={PROFILE_RATINGS_GRID_CLASS_NAME}>
        {Array.from({ length: RATING_SKELETON_COUNT }, (_, index) => (
          <div
            className="overflow-hidden rounded-sm bg-card"
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton order never changes
            key={index}
          >
            <Skeleton className="aspect-[2/3] w-full rounded-none" />
            <div className="px-2 py-1">
              <div className="flex h-5 items-center">
                <Skeleton className="h-3.5 w-4/5" />
              </div>
              <div className="flex h-5 items-center justify-between gap-2">
                <Skeleton className="h-3.5 w-9" />
                <Skeleton className="h-3.5 w-8" />
              </div>
            </div>
          </div>
        ))}
      </MovieGrid>
    </section>
  );
}
