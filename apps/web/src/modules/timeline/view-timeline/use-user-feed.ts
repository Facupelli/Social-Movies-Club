import { infiniteQueryOptions } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/utilities/app.constants";
import type { FeedItem } from "@/modules/profiles/user.types";

type UserFeedPage = {
	items: FeedItem[];
	nextCursor: string | null;
};

type LoadUserFeedPage = (params: {
	cursor: string | null;
	signal?: AbortSignal;
}) => Promise<UserFeedPage>;

async function getUserFeed({
	cursor,
	signal,
}: {
	cursor: string | null;
	signal?: AbortSignal;
}): Promise<UserFeedPage> {
	const searchParams = new URLSearchParams();
	if (cursor) {
		searchParams.set("cursor", cursor);
	}

	const query = searchParams.size > 0 ? `?${searchParams.toString()}` : "";
	const response = await fetch(`/api/user/feed${query}`, {
		cache: "no-store",
		signal,
	});
	if (!response.ok) {
		throw new Error("Network response was not ok");
	}
	return response.json();
}

const getUserFeedQueryOptions = (
	userId: string | undefined,
	loadPage: LoadUserFeedPage = getUserFeed,
) =>
	infiniteQueryOptions({
		queryKey: QUERY_KEYS.getUserFeed(userId),
		queryFn: ({ pageParam = null, signal }) =>
			loadPage({ cursor: pageParam, signal }),
		initialPageParam: null as string | null,
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		enabled: Boolean(userId),
		refetchIntervalInBackground: false,
		refetchOnWindowFocus: false,
	});

export { getUserFeedQueryOptions, getUserFeed };
