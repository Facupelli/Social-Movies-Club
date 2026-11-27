import {
  WATCHLIST_CARD_CLASS_NAME,
  WATCHLIST_CARD_POSTER_CLASS_NAME,
} from '@/modules/watchlist/view-watchlist/watchlist-card.styles';
import { Skeleton } from '@/shared/ui/skeleton';

export default function WatchlistLoading() {
  return (
    <section className="space-y-4 py-6 md:pb-10">
      <div className="space-y-1">
        <div className="flex h-10 items-center justify-between gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-36 rounded-md sm:w-56" />
        </div>
        <Skeleton className="h-11 w-40 rounded-full" />
      </div>
      <div className="space-y-3">
        {['first', 'second', 'third', 'fourth', 'fifth', 'sixth'].map((row) => (
          <div className={WATCHLIST_CARD_CLASS_NAME} key={row}>
            <Skeleton
              className={`${WATCHLIST_CARD_POSTER_CLASS_NAME} rounded-none`}
            />
            <div className="flex flex-col gap-1 px-2 pt-2">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-1/2" />
              <div className="mt-auto flex h-11 items-center justify-end gap-1">
                <div className="grid size-11 place-items-center">
                  <Skeleton className="size-4" />
                </div>
                <div className="grid size-11 place-items-center">
                  <Skeleton className="size-4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
