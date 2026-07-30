import { Skeleton } from '@/shared/ui/skeleton';

const SEARCH_SKELETON_KEYS = ['one', 'two', 'three', 'four'] as const;

export function SearchResultsSkeleton() {
  return (
    <output className="block space-y-3">
      <Skeleton className="mb-4 h-4 w-48" />
      {SEARCH_SKELETON_KEYS.map((key) => (
        <div
          className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 overflow-hidden rounded-md border border-border bg-card p-1.5 sm:grid-cols-[128px_minmax(0,1fr)] sm:gap-4 sm:p-3"
          key={key}
        >
          <Skeleton className="aspect-[2/3] w-full rounded-sm" />
          <div className="flex min-w-0 flex-col">
            <Skeleton className="h-5 w-4/5 sm:h-6" />
            <Skeleton className="mt-1 h-3 w-3/5 sm:h-4" />
            <div className="mt-2 hidden space-y-1.5 sm:block">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <div className="mt-auto flex gap-2 pt-2 sm:pt-3">
              <Skeleton className="size-10 rounded-md" />
              <Skeleton className="size-10 rounded-md" />
            </div>
            <div className="mt-2 flex items-center gap-2 border-border border-t pt-2 sm:mt-3 sm:gap-3 sm:pt-3">
              <Skeleton className="size-7 shrink-0 rounded-full sm:size-8" />
              <Skeleton className="h-3 flex-1" />
              <div className="space-y-1">
                <Skeleton className="h-5 w-9" />
                <Skeleton className="h-2.5 w-12" />
              </div>
            </div>
          </div>
        </div>
      ))}
      <span className="sr-only">Cargando resultados</span>
    </output>
  );
}
