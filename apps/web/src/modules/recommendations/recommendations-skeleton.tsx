import { Skeleton } from '@/shared/ui/skeleton';

const PLACEHOLDERS = ['first', 'second', 'third'];

export function RecommendationsSkeleton() {
  return (
    <output
      aria-busy="true"
      aria-label="Cargando recomendaciones"
      className="block"
    >
      <div aria-hidden="true" className="divide-y divide-border">
        {PLACEHOLDERS.map((placeholder) => (
          <div
            className="flex gap-3 px-4 py-6 first:pt-4 md:gap-5 md:px-10 md:py-7"
            key={placeholder}
          >
            <Skeleton className="aspect-[2/3] w-32 shrink-0 rounded-xs md:w-36" />
            <div className="min-w-0 flex-1 py-0.5">
              <Skeleton className="h-6 w-3/4 md:h-7" />
              <Skeleton className="mt-2 h-4 w-40" />
              <Skeleton className="mt-2 h-4 w-20" />
              <div className="mt-5 flex gap-2">
                <Skeleton className="size-12 rounded-full border-2 border-surface md:size-14" />
                <Skeleton className="size-12 rounded-full border-2 border-surface md:size-14" />
                <Skeleton className="size-12 rounded-full border-2 border-surface md:size-14" />
              </div>
              <Skeleton className="mt-3 h-4 w-48" />
              <Skeleton className="mt-2 h-4 w-28" />
            </div>
          </div>
        ))}
      </div>
    </output>
  );
}
