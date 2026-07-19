"use client";

import { useQuery } from "@tanstack/react-query";
import type { MovieView } from "@/media/movie-view";
import { QUERY_KEYS } from "@/lib/app.constants";

async function getMediaByQuery(query: string): Promise<MovieView[]> {
	const searchParams = new URLSearchParams({ q: query });
	const response = await fetch(`/api/movie?${searchParams.toString()}`);
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
