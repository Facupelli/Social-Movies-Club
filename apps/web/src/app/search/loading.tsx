import { Skeleton } from '@/shared/ui/skeleton';

export default function SearchLoading() {
  return (
    <div className="flex-1 space-y-6 px-4 py-6 md:px-10">
      <div className="space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-11 w-full" />
      </div>
    </div>
  );
}
