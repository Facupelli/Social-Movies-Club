"use client";

import { infiniteQueryOptions } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/app.constants";
import type { AggregatedFeedItem } from "../feed.types";

async function getUserFeed({
	cursor,
}: {
	cursor: string | null;
}): Promise<{ items: AggregatedFeedItem[]; nextCursor: string | null }> {
	const url = new URL("/api/user/feed/aggregated", window.location.origin);
	if (cursor) {
		url.searchParams.set("cursor", cursor);
	}

	const response = await fetch(url);
	if (!response.ok) {
		throw new Error("Network response was not ok");
	}
	return response.json();
}

const getUserAggregatedFeedQueryOptions = infiniteQueryOptions({
	queryKey: QUERY_KEYS.USER_AGGREGATED_FEED,
	queryFn: async ({ pageParam = null }) =>
		await getUserFeed({ cursor: pageParam }),
	initialPageParam: null as string | null,
	getNextPageParam: (lastPage) => lastPage.nextCursor,
	refetchIntervalInBackground: false,
	refetchOnWindowFocus: false,
});

export { getUserAggregatedFeedQueryOptions };
