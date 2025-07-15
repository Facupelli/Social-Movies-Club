"use client";

import { infiniteQueryOptions } from "@tanstack/react-query";
import type { FeedItem } from "../user.types";

async function getUserFeed({
  cursor,
}: {
  cursor: string | null;
}): Promise<{ items: FeedItem[]; nextCursor: string | null }> {
  const url = new URL("/api/user/feed", window.location.origin);
  if (cursor) {
    url.searchParams.set("cursor", cursor);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

const getUserFeedQueryOptions = infiniteQueryOptions({
  queryKey: ["user-feed"],
  queryFn: async ({ pageParam = null }) =>
    await getUserFeed({ cursor: pageParam }),
  initialPageParam: null as string | null,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});

export { getUserFeedQueryOptions, getUserFeed };
