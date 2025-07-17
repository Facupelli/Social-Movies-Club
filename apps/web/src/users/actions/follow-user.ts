"use server";

import { revalidateTag } from "next/cache";
import { FollowService } from "@/follows/follow.service";
import { withAuth } from "@/lib/auth-server-action.middleware";
import { validateFollowUser } from "../user-validation.service";

export async function followUser(
	_: { success: boolean; error?: string },
	formData: FormData,
) {
	return await withAuth(async (session) => {
		const { followedUserId } = validateFollowUser(formData);

		const followService = new FollowService();
		await followService.followUser(session.user.id, followedUserId);

		revalidateTag(`is-following-user:${followedUserId}`);

		return { success: true, error: "" };
	});
}

export async function unfollowUser(
	_: { success: boolean; error?: string },
	formData: FormData,
) {
	return await withAuth(async (session) => {
		const { followedUserId } = validateFollowUser(formData);

		const followService = new FollowService();
		await followService.unfollowUser(session.user.id, followedUserId);

		revalidateTag(`is-following-user:${followedUserId}`);

		return { success: true, error: "" };
	});
}
