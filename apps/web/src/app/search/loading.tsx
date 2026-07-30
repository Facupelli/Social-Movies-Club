import { Skeleton } from '@/shared/ui/skeleton';

const SEARCH_LOADING_KEYS = ['one', 'two', 'three'] as const;

export default function SearchLoading() {
  return (
    <div className="mx-auto flex-1 space-y-5 px-4 py-6 md:max-w-3xl md:px-8 md:py-8">
      <div className="space-y-2">
        <Skeleton className="mx-auto h-7 w-36" />
        <Skeleton className="mx-auto h-4 w-72 max-w-full" />
      </div>
      <Skeleton className="h-12 w-full rounded-md" />
      <Skeleton className="h-5 w-48" />
      <div className="space-y-3">
        {SEARCH_LOADING_KEYS.map((key) => (
          <div
            className="grid grid-cols-[104px_minmax(0,1fr)] gap-3 rounded-md border border-border p-3"
            key={key}
          >
            <Skeleton className="aspect-[2/3] w-full rounded-sm" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
