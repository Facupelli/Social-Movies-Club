import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { HomePageClient } from "@/modules/timeline/view-timeline/home-page-client";
import { getServerSession } from "@/platform/auth/get-server-session";
import { makeQueryClient } from "@/platform/react-query/query-client";
import { getUserFeedQueryOptions } from "@/modules/timeline/view-timeline/use-user-feed";
import { loadUserFeedPage } from "@/modules/ratings/list-profile-ratings/user-query-loaders.server";

export default async function HomePage({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const [session, resolvedSearchParams] = await Promise.all([
		getServerSession(),
		searchParams,
	]);
	const viewerUserId = session?.user.id;
	const rawQuery = resolvedSearchParams.q;
	const initialQuery = Array.isArray(rawQuery) ? (rawQuery[0] ?? "") : rawQuery;

	if (!viewerUserId) {
		return <HomePageClient initialQuery={initialQuery} />;
	}

	const queryClient = makeQueryClient();
	await queryClient.prefetchInfiniteQuery(
		getUserFeedQueryOptions(viewerUserId, ({ cursor }) =>
			loadUserFeedPage({ userId: viewerUserId, cursor }),
		),
	);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<HomePageClient
				initialQuery={initialQuery}
				viewerUserId={viewerUserId}
			/>
		</HydrationBoundary>
	);
}
