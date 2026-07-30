import { Skeleton } from '@/shared/ui/skeleton';

const FEED_PLACEHOLDERS = ['first', 'second', 'third', 'fourth'];

export function HomePageSkeleton() {
  return (
    <output
      aria-busy="true"
      aria-label="Cargando inicio"
      className="relative block min-h-svh flex-1 py-6 md:min-h-auto"
    >
      <FeedSkeleton />
    </output>
  );
}

export function FeedSkeleton() {
  return (
    <div aria-hidden="true" className="divide-y divide-border">
      {FEED_PLACEHOLDERS.map((placeholder) => (
        <div
          className="flex gap-3 px-4 py-4 md:gap-4 md:px-10 md:py-5"
          key={placeholder}
        >
          <Skeleton className="size-9 shrink-0 rounded-full md:size-10" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-44 max-w-[55vw]" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="size-8 rounded-md" />
            </div>
            <div className="mt-3 flex gap-3 md:gap-4">
              <Skeleton className="aspect-[2/3] w-[84px] shrink-0 rounded-xs md:w-[104px]" />
              <div className="flex-1 space-y-3 py-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-4 h-8 w-16" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Skeleton className="size-7 rounded-full" />
              <Skeleton className="h-3 w-48 max-w-[60vw]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
