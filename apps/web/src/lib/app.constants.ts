import type {
	UserMoviesSortBy,
	UserMoviesSortOrder,
	UserMoviesTypeFilter,
} from "@/users/user.types";

export const LOCAL_STORAGE_KEYS: { [key: string]: string } = {
	PROFILE_TAB_VIEW: "profile-tab-view",
};

export const QUERY_KEYS = {
	USER: ["user"],
	USER_FEED: ["user-feed"],
	USER_RATINGS: ["user-ratings"],
	USER_WATCHLIST: ["user-watchlist"],
	getSearchUsers: (query: string) => ["search-users", { query }],
	getSearchMedia: (query: string) => ["search-media", { query }],
	getWatchProviders: (mediaId: number, type: string) => [
		"watch-providers",
		{ mediaId },
		{ type },
	],
	getUserMovies: (
		userId: string,
		sortBy: UserMoviesSortBy | null,
		sortOrder: UserMoviesSortOrder | null,
		typeFilter: UserMoviesTypeFilter | null,
	) => ["user-movies", { userId }, { sortBy }, { sortOrder }, { typeFilter }],
} as const;

export const NEXT_CACHE_TAGS = {
	getUserWatchlist: (userId: string) => `watchlist:${userId}`,
	getIsFollowingUser: (userId: string) => `is-following-user:${userId}`,
	getUserProfile: (userId: string) => `user-profile:${userId}`,
} as const;
