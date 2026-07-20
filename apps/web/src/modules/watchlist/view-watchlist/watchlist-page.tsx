import { unstable_cache } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { MovieGrid } from '@/modules/media-catalog/components/movie-grid';
import { getMediaIdentityKey } from '@/modules/media-catalog/media-identity';
import type { MovieView } from '@/modules/media-catalog/movie-view';
import { WatchlistService } from '@/modules/watchlist/view-watchlist/watchlist.service';
import { GridMovieCard } from '@/modules/watchlist/view-watchlist/watchlist-movie-card';
import { auth } from '@/platform/auth/auth';
import { type ApiResponse, execute } from '@/shared/http/safe-execute';
import { NEXT_CACHE_TAGS } from '@/shared/utilities/app.constants';

function getWatchlist(userId: string): Promise<ApiResponse<MovieView[]>> {
  const watchlistService = new WatchlistService();

  return unstable_cache(
    () => execute<MovieView[]>(() => watchlistService.getWatchlist(userId)),
    ['user-watchlist', userId],
    {
      tags: ['watchlist', NEXT_CACHE_TAGS.getUserWatchlist(userId)],
    }
  )();
}

export default async function WatchlistPage(
  props: Readonly<{
    params: Promise<{ id: string }>;
  }>
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/');
  }

  const params = await props.params;
  const userId = params.id;
  const isOwner = session.user.id === userId;

  const watchlistResult = await getWatchlist(userId);

  if (!watchlistResult.success) {
    return <section className="py-10">{watchlistResult.error}</section>;
  }

  const watchlist = watchlistResult.data;

  return (
    <section className="py-10">
      <MovieGrid>
        {watchlist?.map((movie) => (
          <GridMovieCard
            isOwner={isOwner}
            key={getMediaIdentityKey(movie.tmdbId, movie.type)}
            movie={movie}
          />
        ))}
      </MovieGrid>
    </section>
  );
}
