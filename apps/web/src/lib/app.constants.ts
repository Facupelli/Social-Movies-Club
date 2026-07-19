import type { UserMoviesClientFilters } from "@/users/user.types";

export const LOCAL_STORAGE_KEYS: { [key: string]: string } = {
	PROFILE_TAB_VIEW: "profile-tab-view",
};

export const QUERY_KEYS = {
	VIEWER: ["viewer"],
	getViewer: (userId: string | undefined) => ["viewer", userId],
	getUser: (userId: string | undefined) => ["viewer", userId, "user"],
	getUserFeed: (userId: string | undefined) => ["viewer", userId, "feed"],
	getUserAggregatedFeed: (userId: string | undefined) => [
		"viewer",
		userId,
		"aggregated-feed",
	],
	getUserRatings: (userId: string | undefined) => [
		"viewer",
		userId,
		"ratings",
	],
	getUserWatchlist: (userId: string | undefined) => [
		"viewer",
		userId,
		"watchlist",
	],
	getUserNotificationsCount: (userId: string | undefined) => [
		"viewer",
		userId,
		"notifications-count",
	],
	getSearchUsers: (query: string) => ["search-users", { query }],
	getSearchMedia: (query: string) => ["search-media", { query }],
	getWatchProviders: (mediaId: number, type: string) => [
		"watch-providers",
		{ mediaId },
		{ type },
	],
	getUserMovies: (
		viewerUserId: string | undefined,
		filters: UserMoviesClientFilters & { userId: string },
	) => [
		"viewer",
		viewerUserId,
		"profile-movies",
		{ userId: filters.userId },
		{ sortBy: filters.sortBy },
		{ sortOrder: filters.sortOrder },
		{ typeFilter: filters.typeFilter },
		{ bothRatedFilter: filters.bothRated },
	],
} as const;

export const NEXT_CACHE_TAGS = {
	getUserWatchlist: (userId: string) => `watchlist:${userId}`,
	getIsFollowingUser: (sessionUserId: string, profileUserId: string) =>
		`is-following-user:${sessionUserId}:${profileUserId}`,
	getIsFollowingUserByProfile: (profileUserId: string) =>
		`is-following-user:profile:${profileUserId}`,
	getIsFollowingUserBySession: (sessionUserId: string) =>
		`is-following-user:session:${sessionUserId}`,
	getUserProfile: (userId: string) => `user-profile:${userId}`,
} as const;
