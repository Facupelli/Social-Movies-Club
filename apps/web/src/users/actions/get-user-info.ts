import { unstable_cache } from "next/cache";
import { FollowService } from "@/follows/follow.service";
import { NEXT_CACHE_TAGS } from "@/lib/app.constants";
import { UserService } from "../user.service";

export function getIsFollowingUser(
	sessionUserId: string,
	profileUserId: string,
) {
	const followService = new FollowService();

	return unstable_cache(
		() => followService.isFollowingUser(sessionUserId, profileUserId),
		["is-following-user", sessionUserId, profileUserId],
		{
			tags: [
				"is-following-user",
				NEXT_CACHE_TAGS.getIsFollowingUser(sessionUserId, profileUserId),
				NEXT_CACHE_TAGS.getIsFollowingUserByProfile(profileUserId),
				NEXT_CACHE_TAGS.getIsFollowingUserBySession(sessionUserId),
			],
		},
	)();
}

export function getUserProfile(profileUserId: string) {
	const userService = new UserService();

	return unstable_cache(
		() => userService.getUser(profileUserId),
		["user-profile", profileUserId],
		{
			tags: ["user-profile", NEXT_CACHE_TAGS.getUserProfile(profileUserId)],
		},
	)();
}
