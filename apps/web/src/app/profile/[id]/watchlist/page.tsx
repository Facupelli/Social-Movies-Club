import type { MovieView } from "@/components/movies/movie-card";
import { MovieGrid } from "@/components/movies/movie-grid";
import { auth } from "@/lib/auth";
import { GridMovieCard } from "@/watchlist/components/watchlist-movie-card";
import { WatchlistService } from "@/watchlist/watchlist.service";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

function getUserWatchlist(userId: string): Promise<MovieView[]> {
  const watchlistService = new WatchlistService();
  return watchlistService.getWatchlist(userId);
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
    redirect("/");
  }

  const params = await props.params;
  const watchlist = await getUserWatchlist(params.id);

  return (
    <section className="pt-10">
      <MovieGrid>
        {watchlist?.map((movie) => (
          <GridMovieCard movie={movie} key={movie.tmdbId} />
        ))}
      </MovieGrid>
    </section>
  );
}
