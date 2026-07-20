import { headers } from "next/headers";
import { auth } from "@/platform/auth/auth";
import { authenticatedJson, unauthorizedJson } from "@/shared/http/authenticated-response";
import { UserService } from "@/modules/profiles/user.service";
import type { GetUserRatingMovies } from "@/modules/profiles/user.types";

export type UseUserMoviesMap = Record<
	number,
	{ isRated: boolean; score: number }
>;

export async function GET() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return unauthorizedJson();
	}

	const userService = new UserService();

	const res: GetUserRatingMovies = await userService.getUserRatingMovies(
		session.user.id,
	);

	const statusMap: UseUserMoviesMap = {};

	for (const result of res.data) {
		if (statusMap[result.tmdbId]) {
			continue;
		}

		statusMap[result.tmdbId] = {
			isRated: true,
			score: result.score,
		};
	}

	return authenticatedJson(statusMap);
}
