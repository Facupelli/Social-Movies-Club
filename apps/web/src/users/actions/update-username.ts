"use server";

import { revalidateTag } from "next/cache";
import { NEXT_CACHE_TAGS } from "@/lib/app.constants";
import { withAuth } from "@/lib/auth/auth-server-action.middleware";
import { type ApiResponse, execute } from "@/lib/safe-execute";
import { UserService } from "../user.service";
import { validateUpdateUsername } from "../user-validation.service";

export async function updateUserName(
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
