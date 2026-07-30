import { Skeleton } from '@/shared/ui/skeleton';

const RATING_ROW_KEYS = ['first', 'second', 'third'] as const;

export default function MediaDetailLoading() {
  return (
    <main className="pb-10">
      <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-4 border-border border-b px-4 pt-8 pb-6 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6 md:px-8">
        <Skeleton className="aspect-[2/3] rounded-md" />
        <div className="flex min-w-0 flex-col justify-end gap-3">
          <div className="space-y-2">
            <Skeleton className="h-8 w-full max-w-sm" />
            <Skeleton className="h-5 w-36" />
          </div>
          <div className="flex max-w-52 gap-2">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4 py-4 md:px-8">
        <section className="space-y-3 rounded-md border border-border p-3">
          <Skeleton className="h-5 w-40" />

          <div className="flex items-center gap-3 border-border border-b pb-3">
            <div className="flex shrink-0 -space-x-2">
              <Skeleton className="size-8 rounded-full border-2 border-card" />
              <Skeleton className="size-8 rounded-full border-2 border-card" />
              <Skeleton className="size-8 rounded-full border-2 border-card" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>

          <div className="divide-y divide-border">
            {RATING_ROW_KEYS.map((key) => (
              <div
                className="flex min-h-14 items-center gap-2.5 px-1 py-2"
                key={key}
              >
                <Skeleton className="size-9 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-5 w-10" />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2 rounded-md border border-border p-3">
          <Skeleton className="h-5 w-28" />
          <div className="flex items-center justify-between gap-3 py-1">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-4 w-28" />
          </div>
        </section>

        <section className="space-y-3">
          <Skeleton className="h-7 w-24" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </section>
      </div>
    </main>
  );
}
