"use server";

import { revalidateTag } from "next/cache";
import { NEXT_CACHE_TAGS } from "@/lib/app.constants";
import { withAuth } from "@/lib/auth-server-action.middleware";
import { UserService } from "../user.service";
import { validateUpdateUsername } from "../user-validation.service";

export async function updateUserName(formData: FormData) {
	return await withAuth(async (session) => {
		const { username } = validateUpdateUsername(formData);

		const userService = new UserService();
		await userService.updateUsername(session.user.id, username);

		revalidateTag(NEXT_CACHE_TAGS.getUserProfile(session.user.id));

		return {
			success: true,
			error: "",
		};
	});
}
