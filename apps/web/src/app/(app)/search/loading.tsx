import { SearchResultsSkeleton } from '@/modules/media-catalog/search-media/search-results-skeleton';
import { Skeleton } from '@/shared/ui/skeleton';

export default function SearchLoading() {
  return (
    <main className="mx-auto min-w-0 max-w-3xl flex-1 px-4 py-6 md:px-8 md:py-8">
      <header className="mb-3 md:mb-4">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="mt-2 h-12 w-full rounded-md" />
      </header>
      <SearchResultsSkeleton />
    </main>
  );
}
