import { headers } from "next/headers";
import type { User } from "@/platform/database/postgres/schema";
import { auth } from "@/platform/auth/auth";
import { authenticatedJson, unauthorizedJson } from "@/shared/http/authenticated-response";
import { UserService } from "@/modules/profiles/user.service";

export async function GET() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return unauthorizedJson();
	}

	const userService = new UserService();

	const res: User | null = await userService.getUser(session.user.id);
	return authenticatedJson(res);
}
