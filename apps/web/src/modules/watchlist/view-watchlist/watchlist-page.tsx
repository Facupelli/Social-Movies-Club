import { notFound, redirect } from 'next/navigation';
import z from 'zod';
import { MovieGrid } from '@/modules/media-catalog/components/movie-grid';
import { getMediaIdentityKey } from '@/modules/media-catalog/media-identity';
import { GridMovieCard } from '@/modules/watchlist/view-watchlist/watchlist-movie-card';
import { getWatchlist } from '@/modules/watchlist/view-watchlist/watchlist';
import { getServerSession } from '@/platform/auth/get-server-session';
import { execute } from '@/shared/http/safe-execute';

const profileIdSchema = z.uuid();

export default async function WatchlistPage(
  props: Readonly<{
    params: Promise<{ id: string }>;
  }>
) {
  const [session, params] = await Promise.all([getServerSession(), props.params]);

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
    return <section className="py-10">{watchlistResult.error}</section>;
  }

  return (
    <section className="py-10">
      <MovieGrid>
        {watchlistResult.data.map((movie) => (
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
