"use server";

import { revalidateTag } from "next/cache";
import { FollowService } from "@/follows/follow.service";
import { withAuth } from "@/lib/auth/auth-server-action.middleware";
import { type ApiResponse, execute } from "@/lib/safe-execute";
import { validateFollowUser } from "../user-validation.service";

export async function followUser(
	_: ApiResponse<void>,
	formData: FormData,
): Promise<ApiResponse<void>> {
	return await withAuth(async (session) => {
		const { followedUserId } = validateFollowUser(formData);

		const followService = new FollowService();

		const result = await execute<void>(async () => {
			await followService.followUser(session.user.id, followedUserId);
		});

		if (result.success) {
			revalidateTag(`is-following-user:${followedUserId}`);
		}

		return result;
	});
}

export async function unfollowUser(
	_: ApiResponse<void>,
	formData: FormData,
): Promise<ApiResponse<void>> {
	return await withAuth(async (session) => {
		const { followedUserId } = validateFollowUser(formData);

		const followService = new FollowService();

		const result = await execute<void>(async () => {
			await followService.unfollowUser(session.user.id, followedUserId);
		});

		if (result.success) {
			revalidateTag(`is-following-user:${followedUserId}`);
		}

		return result;
	});
}
