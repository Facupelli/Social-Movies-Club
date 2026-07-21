import { Search } from 'lucide-react';
import { Skeleton } from '@/shared/ui/skeleton';

export function UsersPageSkeleton() {
  return (
    <output
      aria-busy="true"
      aria-label="Cargando búsqueda de usuarios"
      className="block min-h-svh flex-1 py-6 md:min-h-auto"
    >
      <div className="flex max-h-96 flex-col items-center gap-y-2 overflow-hidden pb-6">
        <Skeleton className="size-20 rounded-2xl" />
        <Skeleton className="h-8 w-64 max-w-[calc(100%-2rem)]" />
        <div className="flex w-full flex-col items-center gap-2 px-4">
          <Skeleton className="h-5 w-full max-w-md" />
          <Skeleton className="h-5 w-3/4 max-w-sm" />
        </div>
      </div>

      <div className="px-2 pb-4 md:px-10 md:pb-6">
        <div className="relative h-9 w-full rounded-md border border-input bg-transparent">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary" />
          <Skeleton className="absolute top-1/2 left-10 h-4 w-44 -translate-y-1/2" />
        </div>
      </div>

      <div className="min-h-40 px-4 md:px-10" />
    </output>
  );
}
