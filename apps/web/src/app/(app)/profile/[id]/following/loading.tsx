import { Skeleton } from '@/shared/ui/skeleton';

export default function FollowingPageLoading() {
  return (
    <div aria-hidden="true" className="pt-4">
      {['first', 'second', 'third', 'fourth', 'fifth'].map((row) => (
        <div
          className="relative flex items-center justify-between gap-2 py-1.5 not-last:after:absolute not-last:after:start-14 not-last:after:end-0 not-last:after:bottom-0 not-last:after:h-px not-last:after:bg-border/60"
          key={row}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Skeleton className="size-11 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-1">
              <Skeleton className="h-3.5 w-28 max-w-full" />
              <Skeleton className="h-3 w-20 max-w-full" />
            </div>
          </div>
          <Skeleton className="h-6 w-22 shrink-0" />
        </div>
      ))}
    </div>
  );
}
