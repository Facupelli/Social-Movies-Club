import { MovieGrid } from "@/components/movies/movie-grid";
import { Skeleton } from "@/components/ui/skeleton";

export default function WatchlistLoading() {
  return (
    <section className="pt-10">
      <MovieGrid>
        {[...Array(6)].map((_, idx) => (
          // biome-ignore lint:reason
          <Skeleton key={idx} className="w-[210px] h-[410px]" />
        ))}
      </MovieGrid>
    </section>
  );
}
