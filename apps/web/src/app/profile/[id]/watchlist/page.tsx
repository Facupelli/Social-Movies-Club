import { unstable_cache } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { MovieView } from "@/components/movies/movie-card";
import { MovieGrid } from "@/components/movies/movie-grid";
import { NEXT_CACHE_TAGS } from "@/lib/app.constants";
import { auth } from "@/lib/auth/auth";
import { type ApiResponse, execute } from "@/lib/safe-execute";
import { GridMovieCard } from "@/watchlist/components/watchlist-movie-card";
import { WatchlistService } from "@/watchlist/watchlist.service";

function getWatchlist(userId: string): Promise<ApiResponse<MovieView[]>> {
	const watchlistService = new WatchlistService();

	return unstable_cache(
		() => execute<MovieView[]>(() => watchlistService.getWatchlist(userId)),
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

	const watchlistResult = await getWatchlist(userId);

	if (!watchlistResult.success) {
		return <section className="py-10">{watchlistResult.error}</section>;
	}

	const watchlist = watchlistResult.data;

	console.log({ watchlist });

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
