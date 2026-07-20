import { MovieGrid } from "@/modules/media-catalog/components/movie-grid";
import { Skeleton } from "@/shared/ui/skeleton";

export default function WatchlistLoading() {
	return (
		<section className="pt-10">
			<MovieGrid>
				{[...Array(6)].map((_, idx) => (
					<Skeleton
						// biome-ignore lint:reason
						key={idx}
						className="w-[120px] h-[180px] md:w-[210px] md:h-[410px]"
					/>
				))}
			</MovieGrid>
		</section>
	);
}
