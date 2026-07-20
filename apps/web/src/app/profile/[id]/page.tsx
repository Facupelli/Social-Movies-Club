import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getServerSession } from "@/platform/auth/get-server-session";
import { makeQueryClient } from "@/platform/react-query/query-client";
import { getUserMoviesQueryOptions } from "@/modules/ratings/list-profile-ratings/use-user-movies";
import { loadUserMoviesPage } from "@/modules/ratings/list-profile-ratings/profile-ratings-query-loader.server";
import { userMoviesFiltersUrlParser } from "@/modules/ratings/list-profile-ratings/filters/filter-user-movies-parser";
import { ProfileRatingsClient } from "@/modules/ratings/list-profile-ratings/profile-ratings-client";

type ProfileRatingsPageProps = {
	params: Promise<{ id: string }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function toUrlSearchParams(
	searchParams: Record<string, string | string[] | undefined>,
) {
	const result = new URLSearchParams();

	for (const [key, value] of Object.entries(searchParams)) {
		if (Array.isArray(value)) {
			for (const item of value) {
				result.append(key, item);
			}
		} else if (value !== undefined) {
			result.set(key, value);
		}
	}

	return result;
}

export default async function ProfileRatingsPage({
	params,
	searchParams,
}: ProfileRatingsPageProps) {
	const [session, { id: profileUserId }, rawSearchParams] = await Promise.all([
		getServerSession(),
		params,
		searchParams,
	]);

	if (!session) {
		redirect("/");
	}

	const viewerUserId = session.user.id;
	const filters = userMoviesFiltersUrlParser.parseSearchParams(
		toUrlSearchParams(rawSearchParams),
	);
	const queryClient = makeQueryClient();

	await queryClient.prefetchInfiniteQuery(
		getUserMoviesQueryOptions(
			viewerUserId,
			{ userId: profileUserId, ...filters },
			(userId, serverFilters) =>
				loadUserMoviesPage({
					profileUserId: userId,
					viewerUserId,
					filters: serverFilters,
				}),
		),
	);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ProfileRatingsClient
				profileUserId={profileUserId}
				viewerUserId={viewerUserId}
			/>
		</HydrationBoundary>
	);
}
