import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { authenticatedJson, unauthorizedJson } from "@/lib/http/authenticated-response";
import { UserService } from "@/users/user.service";
import type { FeedItem } from "@/users/user.types";
import { validateGetUserFeedQuery } from "@/users/user-validation.service";

export async function GET(request: Request) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return unauthorizedJson();
	}

	const { searchParams } = new URL(request.url);
	const { cursor } = validateGetUserFeedQuery(searchParams);

	const userService = new UserService();

	const res: { items: FeedItem[]; nextCursor: string | null } =
		await userService.getFeed({
			userId: session.user.id,
			cursor,
		});
	return authenticatedJson(res);
}
