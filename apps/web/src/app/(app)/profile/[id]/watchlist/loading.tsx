import { MovieGrid } from '@/modules/media-catalog/components/movie-grid';
import { Skeleton } from '@/shared/ui/skeleton';

export default function WatchlistLoading() {
  return (
    <section className="space-y-4 py-6 md:pb-10">
      <div className="space-y-1">
        <div className="flex h-10 items-center justify-between gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-36 rounded-md sm:w-56" />
        </div>
        <Skeleton className="h-11 w-40 rounded-full" />
      </div>
      <MovieGrid>
        {[...Array(6)].map((_, idx) => (
          <div
            className="space-y-3"
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton order never changes
            key={idx}
          >
            <Skeleton className="aspect-[2/3] w-full" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </MovieGrid>
    </section>
  );
}
