import { Search } from 'lucide-react';
import { Skeleton } from '@/shared/ui/skeleton';

const FEED_PLACEHOLDERS = ['first', 'second', 'third', 'fourth'];

export function HomePageSkeleton() {
  return (
    <output
      aria-busy="true"
      aria-label="Cargando inicio"
      className="relative block min-h-svh flex-1 py-6 md:min-h-auto"
    >
      <div className="relative z-20 px-2 pb-2 md:px-10 md:pb-6">
        <div className="relative h-9 rounded-md border border-input bg-input/30">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-primary" />
          <Skeleton className="absolute top-1/2 left-10 h-4 w-44 -translate-y-1/2" />
        </div>
      </div>
      <FeedSkeleton />
    </output>
  );
}

export function FeedSkeleton() {
  return (
    <div className="divide-y divide-border" aria-hidden="true">
      {FEED_PLACEHOLDERS.map((placeholder) => (
        <div className="px-2 md:px-10" key={placeholder}>
          <div className="w-full overflow-hidden px-2 py-4 md:px-0">
            <div className="flex flex-col gap-2 md:flex-row md:gap-6">
              <Skeleton className="hidden size-10 shrink-0 rounded-full md:block" />
              <Skeleton className="h-[250px] w-full shrink-0 rounded-xs md:h-[264px] md:w-44" />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center justify-between gap-4">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-16 shrink-0" />
                </div>
                <div className="space-y-3 pt-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
                <div className="mt-auto pt-4 md:pt-2">
                  <div className="flex h-[68px] items-center gap-3 rounded-sm bg-muted/50 p-3">
                    <Skeleton className="size-7 shrink-0 rounded-full md:hidden" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="size-10 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
