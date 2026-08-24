import { Skeleton } from '@/shared/ui/skeleton';

export function StreamingPreferencesSkeleton() {
  return (
    <div className="min-h-svh p-4 md:px-10 md:py-6">
      <header className="flex items-center gap-2">
        <Skeleton className="-ml-2 size-11 shrink-0 rounded-sm" />
        <Skeleton className="h-6 w-32" />
      </header>

      <Skeleton className="mt-4 h-4 w-full max-w-sm" />

      <div className="pt-6">
        <Skeleton className="h-3 w-10" />
        <Skeleton className="mt-2 h-5 w-24" />
      </div>

      <ul
        aria-label="Cargando plataformas"
        className="divide-border divide-y border-border border-y"
      >
        {[0, 1, 2, 3, 4].map((index) => (
          <li className="flex min-h-14 items-center gap-3 py-3" key={index}>
            <Skeleton className="size-[30px] rounded-sm" />
            <Skeleton className="h-4 w-32" />
          </li>
        ))}
      </ul>
    </div>
  );
}
