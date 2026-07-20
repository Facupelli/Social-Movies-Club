import "server-only";

import type { FeedItem } from "@/modules/profiles/user.types";
import { UserService } from "@/modules/profiles/user.service";

export type UserFeedPage = {
	items: FeedItem[];
	nextCursor: string | null;
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
