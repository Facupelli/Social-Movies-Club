import "server-only";

import type { MovieView } from "@/media/movie-view";
import { dbMovieToView } from "@/media/media.adapters";
import type { FeedItem, UserMoviesServerFilters } from "./user.types";
import { UserService } from "./user.service";

export type UserFeedPage = {
	items: FeedItem[];
	nextCursor: string | null;
};

export type UserMoviesPage = {
	data: MovieView[];
	nextCursor: number | null;
};

export async function loadUserFeedPage({
	userId,
	cursor,
}: {
	userId: string;
	cursor?: string | null;
}): Promise<UserFeedPage> {
	const userService = new UserService();
	return await userService.getFeed({ userId, cursor });
}

export async function loadUserMoviesPage({
	profileUserId,
	viewerUserId,
	filters,
}: {
	profileUserId: string;
	viewerUserId: string;
	filters: UserMoviesServerFilters;
}): Promise<UserMoviesPage> {
	const userService = new UserService();
	const result = await userService.getUserRatingMovies(
		profileUserId,
		filters,
		viewerUserId,
	);

	return {
		data: result.data.map(dbMovieToView),
		nextCursor: result.nextCursor,
	};
}
