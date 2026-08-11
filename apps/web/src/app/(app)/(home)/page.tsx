import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { loadUserFeedPage } from '@/modules/timeline/view-timeline/timeline-query-loader.server';
import { HomePageClient } from '@/modules/timeline/view-timeline/home-page-client';
import { getUserFeedQueryOptions } from '@/modules/timeline/view-timeline/use-user-feed';
import { getServerSession } from '@/platform/auth/get-server-session';
import { makeQueryClient } from '@/platform/react-query/query-client';

export default async function HomePage() {
  const session = await getServerSession();
  const viewerUserId = session?.user.id;

  if (!viewerUserId) {
    return <HomePageClient />;
  }

  const queryClient = makeQueryClient();
  await queryClient.prefetchInfiniteQuery(
    getUserFeedQueryOptions(viewerUserId, () =>
      loadUserFeedPage({ userId: viewerUserId, cursor: null })
    )
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomePageClient viewerUserId={viewerUserId} />
    </HydrationBoundary>
  );
}
