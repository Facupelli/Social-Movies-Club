import { Skeleton } from '@/shared/ui/skeleton';

export function ProfileSkeleton() {
  return (
    <output
      aria-label="Cargando perfil"
      className="grid gap-2 py-4"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="size-[100px] shrink-0 rounded-full" />
        <Skeleton className="h-9 w-20" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="flex h-5 items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
    </output>
  );
}

export function ProfileNavSkeleton() {
  return (
    <div className="flex h-[39px] items-start gap-6 border-border border-b pt-2">
      <Skeleton className="h-5 w-[104px]" />
      <Skeleton className="h-5 w-10" />
      <Skeleton className="h-5 w-[68px]" />
    </div>
  );
}
