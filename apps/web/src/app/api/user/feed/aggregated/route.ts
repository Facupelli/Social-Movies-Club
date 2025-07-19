import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import type { AggregatedFeedItem } from "@/users/feed.types";
import { UserService } from "@/users/user.service";
import { validateGetUserFeedQuery } from "@/users/user-validation.service";

export async function GET(request: Request) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return Response.json({ success: false, error: "Unauthorized" });
	}

	const { searchParams } = new URL(request.url);
	const { cursor } = validateGetUserFeedQuery(searchParams);

	const userService = new UserService();

	const res: { items: AggregatedFeedItem[]; nextCursor: string | null } =
		await userService.getAggregatedFeed({
			userId: session.user.id,
			cursor,
		});
	return Response.json(res);
}
