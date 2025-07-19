import { unstable_cache } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { MovieView } from "@/components/movies/movie-card";
import { MovieGrid } from "@/components/movies/movie-grid";
import { NEXT_CACHE_TAGS } from "@/lib/app.constants";
import { auth } from "@/lib/auth/auth";
import { GridMovieCard } from "@/watchlist/components/watchlist-movie-card";
import { WatchlistService } from "@/watchlist/watchlist.service";

function getWatchlist(userId: string): Promise<MovieView[]> {
	const watchlistService = new WatchlistService();

	return unstable_cache(
		() => watchlistService.getWatchlist(userId),
		["user-watchlist", userId],
		{
			tags: ["watchlist", NEXT_CACHE_TAGS.getUserWatchlist(userId)],
		},
	)();
}

export default async function WatchlistPage(
	props: Readonly<{
		params: Promise<{ id: string }>;
	}>,
) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/");
	}

	const params = await props.params;
	const userId = params.id;

	const watchlist = await getWatchlist(userId);

	return (
		<section className="py-10">
			<MovieGrid>
				{watchlist?.map((movie) => (
					<GridMovieCard movie={movie} key={movie.tmdbId} />
				))}
			</MovieGrid>
		</section>
	);
}
