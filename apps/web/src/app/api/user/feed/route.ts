import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { authenticatedJson, unauthorizedJson } from "@/lib/http/authenticated-response";
import { loadUserFeedPage } from "@/users/user-query-loaders.server";
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

	const res = await loadUserFeedPage({
		userId: session.user.id,
		cursor,
	});
	return authenticatedJson(res);
}
