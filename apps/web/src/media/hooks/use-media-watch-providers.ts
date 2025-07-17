"use client";

import { useQuery } from "@tanstack/react-query";
import type { WatchProviderResult } from "@/infra/TMDB/types/watch-provider";
import { QUERY_KEYS } from "@/lib/app.constants";
import type { MediaType } from "../media.type";

async function getMovieWatchProviders(
	mediaId: number,
	type: MediaType,
): Promise<{ data: WatchProviderResult }> {
	const response = await fetch(`/api/movie/${mediaId}/provider?type=${type}`);
	if (!response.ok) {
		throw new Error("Network response was not ok");
	}
	return response.json();
}

export function useMovieWatchProviders(
	mediaId: number,
	type: MediaType,
	fetch = false,
) {
	return useQuery({
		queryKey: QUERY_KEYS.getWatchProviders(mediaId, type),
		queryFn: () => getMovieWatchProviders(mediaId, type),
		enabled: fetch,
		refetchOnWindowFocus: false,
	});
}
