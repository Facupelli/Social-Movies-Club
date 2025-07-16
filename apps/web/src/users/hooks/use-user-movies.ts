import { infiniteQueryOptions } from "@tanstack/react-query";
import type { GetUserRatingMovies } from "../user.types";
import { dbMovieToView } from "@/movies/movie.adapters";
import type { MovieView } from "@/components/movies/movie-card";
import { QUERY_KEYS } from "@/lib/app.constants";

async function getUserMovies(
  userId: string,
  page: number
): Promise<{ nextCursor: number | null; data: MovieView[] }> {
  const url = new URL(`/api/user/${userId}/movies`, window.location.origin);
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

const getUserMoviesQueryOptions = (userId: string) =>
  infiniteQueryOptions({
    queryKey: QUERY_KEYS.getUserMovies(userId),
    queryFn: async ({ pageParam = 0 }) =>
      await getUserMovies(userId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
  });

export { getUserMovies, getUserMoviesQueryOptions };
