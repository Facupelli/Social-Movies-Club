import { Skeleton } from '@/shared/ui/skeleton';

export function ProfileSkeleton({
  showFollowAction = false,
}: {
  showFollowAction?: boolean;
}) {
  return (
    <output
      aria-label="Cargando perfil"
      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 pb-4"
    >
      <div className="col-span-full row-start-1 flex items-center gap-5 md:gap-6 lg:col-span-1">
        <Skeleton className="size-22 shrink-0 rounded-full" />
        <div className="flex h-26 min-w-0 max-w-64 flex-1 flex-col justify-between py-1">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-2 w-full" />
        </div>
      </div>

      {showFollowAction && (
        <Skeleton className="col-start-2 row-start-2 h-10 w-20 justify-self-end lg:row-start-1" />
      )}

      <Skeleton className="col-start-1 row-start-2 h-7 w-32 max-w-full" />

      <div className="col-span-full row-start-3 flex h-5 items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
    </output>
  );
}

export function ProfileNavSkeleton() {
  return (
    <div className="grid h-[41px] grid-cols-3 place-items-center border-border border-b">
      <Skeleton className="h-3.5 w-21 max-w-full" />
      <Skeleton className="h-3.5 w-8" />
      <Skeleton className="h-3.5 w-15" />
    </div>
  );
}
