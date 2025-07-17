"use client";

import { useQuery } from "@tanstack/react-query";
import type { MovieView } from "@/components/movies/movie-card";
import { QUERY_KEYS } from "@/lib/app.constants";

async function getMediaByQuery(query: string): Promise<MovieView[]> {
	const response = await fetch(`/api/movie/?q=${query}`);
	if (!response.ok) {
		throw new Error("Network response was not ok");
	}

	return response.json();
}

const useSearchMedia = (query: string) => {
	return useQuery({
		queryKey: QUERY_KEYS.getSearchMedia(query),
		queryFn: () => getMediaByQuery(query),
		enabled: query !== "",
		refetchOnWindowFocus: false,
	});
};

export { useSearchMedia, getMediaByQuery };
