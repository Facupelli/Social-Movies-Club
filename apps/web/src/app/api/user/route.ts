import { headers } from "next/headers";
import type { User } from "@/infra/postgres/schema";
import { auth } from "@/lib/auth/auth";
import { authenticatedJson, unauthorizedJson } from "@/lib/http/authenticated-response";
import { UserService } from "@/users/user.service";

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
