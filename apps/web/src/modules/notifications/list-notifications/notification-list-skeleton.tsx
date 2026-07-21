import { Skeleton } from '@/shared/ui/skeleton';

const SKELETON_ROWS = ['first', 'second', 'third', 'fourth', 'fifth'];

export function NotificationListSkeleton() {
  return (
    <section
      aria-label="Cargando notificaciones"
      className="flex flex-col divide-y divide-border border-y border-border"
    >
      {SKELETON_ROWS.map((row) => (
        <div
          className="flex min-h-24 items-start gap-2 px-2 py-4 md:gap-4 md:px-10"
          key={row}
        >
          <Skeleton className="size-7 shrink-0 rounded-full" />
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-48 max-w-[55%]" />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
