import { queryOptions } from "@tanstack/react-query";
import type { UseUserMoviesMap } from "@/app/api/user/[id]/movies/route";
import { QUERY_KEYS } from "@/lib/app.constants";

async function getUserRatings(): Promise<UseUserMoviesMap> {
  const response = await fetch("/api/user/ratings");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

const getUserRatingsQueryOptions = queryOptions({
  queryKey: QUERY_KEYS.USER_RATINGS,
  queryFn: () => getUserRatings(),
  refetchOnWindowFocus: false,
});

export { getUserRatingsQueryOptions, getUserRatings };
