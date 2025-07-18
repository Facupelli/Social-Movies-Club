import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { UserService } from "@/users/user.service";
import type { GetUserRatingMovies } from "@/users/user.types";
import { userMoviesFiltersUrlParser } from "@/users/utils/filter-user-movies-parser";
import { userMoviesFiltersTransformer } from "@/users/utils/filter-user-movies-transformer";

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
		return Response.json({ success: false, error: "Unauthorized" });
	}

	const routeParams = await params;
	const url = new URL(request.url);

	const clientFilters = userMoviesFiltersUrlParser.parseUrl(url);
	const page = parseInt(url.searchParams.get("page") || "0", 10);

	const serverFilters = userMoviesFiltersTransformer.clientToServer(
		clientFilters,
		{
			page,
			limit: 20,
		},
	);

	const userService = new UserService();
	const res: GetUserRatingMovies = await userService.getUserRatingMovies(
		routeParams.id,
		serverFilters,
		session.user.id,
	);

	return Response.json(res);
}
