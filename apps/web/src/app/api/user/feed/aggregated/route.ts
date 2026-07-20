import { headers } from "next/headers";
import { auth } from "@/platform/auth/auth";
import { authenticatedJson, unauthorizedJson } from "@/shared/http/authenticated-response";
import type { AggregatedFeedItem } from "@/modules/timeline/view-timeline/feed.types";
import { UserService } from "@/modules/profiles/user.service";
import { validateGetUserFeedQuery } from "@/modules/account/user-validation";

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

	const res: { items: AggregatedFeedItem[]; nextCursor: string | null } =
		await userService.getAggregatedFeed({
			userId: session.user.id,
			cursor,
		});
	return authenticatedJson(res);
}
