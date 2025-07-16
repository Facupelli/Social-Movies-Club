import { infiniteQueryOptions } from "@tanstack/react-query";
import type { GetUserRatingMovies } from "../user.types";
import { dbMovieToView } from "@/movies/movie.adapters";
import type { MovieView } from "@/components/movies/movie-card";

async function getUserMovies(
  page: number
): Promise<{ nextCursor: number | null; data: MovieView[] }> {
  const url = new URL("/api/user/movies", window.location.origin);
  url.searchParams.set("page", page.toString());

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data: GetUserRatingMovies = await response.json();

  return {
    nextCursor: data.nextCursor,
    data: data.data.map(dbMovieToView),
  };
}

const getUserMoviesQueryOptions = infiniteQueryOptions({
  queryKey: ["user-movies-infinite"],
  queryFn: async ({ pageParam = 0 }) => await getUserMovies(pageParam),
  initialPageParam: 0,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
  refetchOnWindowFocus: false,
  refetchIntervalInBackground: false,
});

export { getUserMovies, getUserMoviesQueryOptions };
