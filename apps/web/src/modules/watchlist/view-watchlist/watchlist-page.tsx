import { notFound } from 'next/navigation';
import { profileIdSchema } from '@/modules/profiles/profile-id';
import { getTrustedRatingSummaries } from '@/modules/trusted-rating-context/get-trusted-rating-summaries/get-trusted-rating-summaries';
import type { TrustedRatingSummary } from '@/modules/trusted-rating-context/trusted-rating-context.types';
import { getWatchlist } from '@/modules/watchlist/view-watchlist/watchlist';
import { WatchlistItemsGrid } from '@/modules/watchlist/view-watchlist/watchlist-items-grid';
import {
  parseWatchlistSort,
  sortWatchlistItems,
} from '@/modules/watchlist/view-watchlist/watchlist-sort';
import { getServerSession } from '@/platform/auth/get-server-session';
import { execute } from '@/shared/http/safe-execute';

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

  const profileId = profileIdSchema.safeParse(params.id);
  if (!profileId.success) {
    notFound();
  }

  const viewerId = session?.user.id;
  const isOwner = viewerId === profileId.data;
  const watchlistResult = await execute(() =>
    getWatchlist({
      ownerId: profileId.data,
      viewerId,
      filterRequested: searchParams.providers === 'mine',
    })
  );

  if (!watchlistResult.success) {
    return (
      <section className="pt-6 pb-10">
        <p className="text-sm text-muted-foreground">
          No pudimos cargar esta lista. Intentá nuevamente.
        </p>
      </section>
    );
  }

  const {
    items: watchlist,
    filterActive,
    canFilter,
    totalCount,
    unknownCount,
  } = watchlistResult.data;

  if (totalCount === 0) {
    return (
      <section className="pt-6 pb-10">
        <p className="text-sm text-muted-foreground">
          {isOwner
            ? 'Tu lista está vacía. Guardá títulos que quieras ver más adelante.'
            : 'Esta lista todavía no tiene títulos.'}
        </p>
      </section>
    );
  }

  const summariesResult =
    viewerId && watchlist.length > 0
      ? await execute(() =>
          getTrustedRatingSummaries(
            viewerId,
            watchlist.map(({ mediaId }) => mediaId)
          )
        )
      : null;
  const socialSortingAvailable =
    Boolean(viewerId) && summariesResult?.success !== false;
  const requestedSort = parseWatchlistSort(searchParams.sort);
  const activeSort = socialSortingAvailable ? requestedSort : 'recently-added';
  const summaries = summariesResult?.success ? summariesResult.data : {};
  const items = sortWatchlistItems(
    watchlist.map((item) => ({
      ...item,
      trustedRating: summaries[item.mediaId] ?? emptySummary(item.mediaId),
    })),
    activeSort
  );

  return (
    <section className="space-y-4 py-6 md:pb-10">
      {summariesResult?.success === false ? (
        <output className="block text-muted-foreground text-sm">
          Las calificaciones de personas que seguís no están disponibles ahora.
        </output>
      ) : null}
      <WatchlistItemsGrid
        activeSort={activeSort}
        canFilter={canFilter}
        filterActive={filterActive}
        filteredTotal={filterActive ? totalCount : undefined}
        hasUnknownAvailability={unknownCount > 0}
        initialItems={items}
        isOwner={isOwner}
        showControls={Boolean(viewerId)}
        socialSortingAvailable={socialSortingAvailable}
      />
    </section>
  );
}

function emptySummary(mediaId: string): TrustedRatingSummary {
  return { mediaId, ratingCount: 0, averageScore: null, previewRaters: [] };
}
