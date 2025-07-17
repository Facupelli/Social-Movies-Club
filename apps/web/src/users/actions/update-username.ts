"use server";

import { withAuth } from "@/lib/auth-server-action.middleware";
import { UserService } from "../user.service";
import { validateUpdateUsername } from "../user-validation.service";

export async function updateUserName(formData: FormData) {
	return await withAuth(async (session) => {
		const { username } = validateUpdateUsername(formData);

		const userService = new UserService();
		await userService.updateUsername(session.user.id, username);

		return {
			success: true,
			error: "",
		};
	});
}
