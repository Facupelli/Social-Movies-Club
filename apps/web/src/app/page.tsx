import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { HomePageClient } from "./home-page-client";
import { getServerSession } from "@/lib/auth/get-server-session";
import { makeQueryClient } from "@/lib/react-query/query-client";
import { getUserFeedQueryOptions } from "@/users/hooks/use-user-feed";
import { loadUserFeedPage } from "@/users/user-query-loaders.server";

export default async function HomePage() {
	const session = await getServerSession();
	const viewerUserId = session?.user.id;

	if (!viewerUserId) {
		return <HomePageClient />;
	}

	const queryClient = makeQueryClient();
	await queryClient.prefetchInfiniteQuery(
		getUserFeedQueryOptions(viewerUserId, ({ cursor }) =>
			loadUserFeedPage({ userId: viewerUserId, cursor }),
		),
	);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<HomePageClient viewerUserId={viewerUserId} />
		</HydrationBoundary>
	);
}
