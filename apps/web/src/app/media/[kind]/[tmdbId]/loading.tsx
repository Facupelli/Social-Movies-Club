import { Skeleton } from '@/shared/ui/skeleton';

export default function MediaDetailLoading() {
  return (
    <main className="pb-10">
      <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-4 border-border border-b px-4 pt-8 pb-6 sm:grid-cols-[160px_minmax(0,1fr)] md:px-8">
        <Skeleton className="aspect-[2/3] rounded-md" />
        <div className="flex flex-col justify-end gap-3">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-full max-w-sm" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-9 w-40" />
        </div>
      </div>
      <div className="space-y-8 px-4 py-8 md:px-8">
        <section className="space-y-4">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </section>
        <section className="space-y-3">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-20 w-full" />
        </section>
      </div>
    </main>
  );
}
