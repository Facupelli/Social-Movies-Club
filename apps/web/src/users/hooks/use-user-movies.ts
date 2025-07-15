import { queryOptions } from "@tanstack/react-query";
import type { UseUserMoviesMap } from "@/app/api/user/movies/route";

async function getUserMovies(): Promise<UseUserMoviesMap> {
  const response = await fetch("/api/user/movies");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

const getUserMoviesQueryOptions = queryOptions({
  queryKey: ["user-movies"],
  queryFn: () => getUserMovies(),
  refetchOnWindowFocus: false,
});

export { getUserMoviesQueryOptions, getUserMovies };
