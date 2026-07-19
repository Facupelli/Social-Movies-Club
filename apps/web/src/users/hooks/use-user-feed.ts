"use client";

import { infiniteQueryOptions } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/app.constants";
import type { FeedItem } from "../user.types";

async function getUserFeed({
	cursor,
	signal,
}: {
	cursor: string | null;
	signal?: AbortSignal;
}): Promise<{ items: FeedItem[]; nextCursor: string | null }> {
	const url = new URL("/api/user/feed", window.location.origin);
	if (cursor) {
		url.searchParams.set("cursor", cursor);
	}

	const response = await fetch(url, { cache: "no-store", signal });
	if (!response.ok) {
		throw new Error("Network response was not ok");
	}
	return response.json();
}

const getUserFeedQueryOptions = (userId: string | undefined) =>
	infiniteQueryOptions({
		queryKey: QUERY_KEYS.getUserFeed(userId),
		queryFn: async ({ pageParam = null, signal }) =>
			await getUserFeed({ cursor: pageParam, signal }),
		initialPageParam: null as string | null,
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		enabled: Boolean(userId),
		refetchIntervalInBackground: false,
		refetchOnWindowFocus: false,
	});

export { getUserFeedQueryOptions, getUserFeed };
