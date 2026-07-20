"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { NEXT_CACHE_TAGS } from "@/shared/utilities/app.constants";
import { withAuth } from "@/platform/auth/auth-server-action.middleware";
import { type ApiResponse, execute } from "@/shared/http/safe-execute";
import { UserService } from "@/modules/profiles/user.service";
import { validateUpdateUsername } from "@/modules/account/user-validation";

export async function updateUsername(
	formData: FormData,
): Promise<ApiResponse<void>> {
	return await withAuth(async (session) => {
		const { username } = validateUpdateUsername(formData);

		const userService = new UserService();

		const result = await execute<void>(async () => {
			await userService.updateUsername(session.user.id, username);
		});

		if (result.success) {
			revalidateTag(NEXT_CACHE_TAGS.getUserProfile(session.user.id));
		}

		return result;
	});
}

export async function createUsername(
	formData: FormData,
): Promise<ApiResponse<void>> {
	return await withAuth(async (session) => {
		const { username } = validateUpdateUsername(formData);

		const userService = new UserService();

		const result = await execute<void>(async () => {
			await userService.updateUsername(session.user.id, username);
		});

		if (result.success) {
			revalidateTag(NEXT_CACHE_TAGS.getUserProfile(session.user.id));
		}

		redirect("/");
	});
}
