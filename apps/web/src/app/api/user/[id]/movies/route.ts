import { headers } from "next/headers";
import { auth } from "@/platform/auth/auth";
import { authenticatedJson, unauthorizedJson } from "@/shared/http/authenticated-response";
import { loadUserMoviesPage } from "@/modules/ratings/list-profile-ratings/user-query-loaders.server";
import { userMoviesFiltersUrlParser } from "@/modules/ratings/list-profile-ratings/filters/filter-user-movies-parser";
import { userMoviesFiltersTransformer } from "@/modules/ratings/list-profile-ratings/filters/filter-user-movies-transformer";

export type UseUserMoviesMap = Record<
	number,
	{ isRated: boolean; score: number }
>;

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return unauthorizedJson();
	}

	const routeParams = await params;
	const url = new URL(request.url);

	const clientFilters = userMoviesFiltersUrlParser.parseUrl(url);
	const page = Number.parseInt(url.searchParams.get("page") || "0", 10);

	const serverFilters = userMoviesFiltersTransformer.clientToServer(
		clientFilters,
		{
			page,
			limit: 20,
		},
	);

	const res = await loadUserMoviesPage({
		profileUserId: routeParams.id,
		viewerUserId: session.user.id,
		filters: serverFilters,
	});

	return authenticatedJson(res);
}
