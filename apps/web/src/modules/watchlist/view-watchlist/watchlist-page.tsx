import { notFound, redirect } from 'next/navigation';
import z from 'zod';
import { getTrustedRatingSummaries } from '@/modules/trusted-rating-context/get-trusted-rating-summaries/get-trusted-rating-summaries';
import type { TrustedRatingSummary } from '@/modules/trusted-rating-context/trusted-rating-context.types';
import { getWatchlist } from '@/modules/watchlist/view-watchlist/watchlist';
import { WatchlistItemsGrid } from '@/modules/watchlist/view-watchlist/watchlist-items-grid';
import {
  parseWatchlistSort,
  sortWatchlistItems,
} from '@/modules/watchlist/view-watchlist/watchlist-sort';
import { WatchlistSortControl } from '@/modules/watchlist/view-watchlist/watchlist-sort-control';
import { getServerSession } from '@/platform/auth/get-server-session';
import { execute } from '@/shared/http/safe-execute';

const profileIdSchema = z.string().nonempty();

type WatchlistPageProps = Readonly<{
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

export default async function WatchlistPage(props: WatchlistPageProps) {
  const [session, params, searchParams] = await Promise.all([
    getServerSession(),
    props.params,
    props.searchParams,
  ]);

  if (!session) {
    redirect('/');
  }

  const profileId = profileIdSchema.safeParse(params.id);
  if (!profileId.success) {
    notFound();
  }

  const isOwner = session.user.id === profileId.data;
  const watchlistResult = await execute(() => getWatchlist(profileId.data));

  if (!watchlistResult.success) {
    return (
      <section className="py-10">
        <p className="text-sm text-muted-foreground">
          No pudimos cargar esta lista. Intentá nuevamente.
        </p>
      </section>
    );
  }

  const watchlist = watchlistResult.data;
  if (watchlist.length === 0) {
    return (
      <section className="py-10">
        <p className="text-sm text-muted-foreground">
          {isOwner
            ? 'Tu lista está vacía. Guardá títulos que quieras ver más adelante.'
            : 'Esta lista todavía no tiene títulos.'}
        </p>
      </section>
    );
  }

  const summariesResult = await execute(() =>
    getTrustedRatingSummaries(
      session.user.id,
      watchlist.map(({ mediaId }) => mediaId)
    )
  );
  const socialSortingAvailable = summariesResult.success;
  const requestedSort = parseWatchlistSort(searchParams.sort);
  const activeSort = socialSortingAvailable ? requestedSort : 'recently-added';
  const summaries = summariesResult.success ? summariesResult.data : {};
  const items = sortWatchlistItems(
    watchlist.map((item) => ({
      ...item,
      trustedRating: summaries[item.mediaId] ?? emptySummary(item.mediaId),
    })),
    activeSort
  );

  return (
    <section className="space-y-4 py-6 md:py-10">
      {socialSortingAvailable ? null : (
        <output className="block text-muted-foreground text-sm">
          Las calificaciones de personas que seguís no están disponibles ahora.
        </output>
      )}
      <WatchlistItemsGrid
        controls={
          <WatchlistSortControl
            socialSortingAvailable={socialSortingAvailable}
            value={activeSort}
          />
        }
        initialItems={items}
        isOwner={isOwner}
      />
    </section>
  );
}

function emptySummary(mediaId: string): TrustedRatingSummary {
  return { mediaId, ratingCount: 0, averageScore: null, previewRaters: [] };
}
