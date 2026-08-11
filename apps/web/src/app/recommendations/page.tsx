import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { RecommendationsClient } from '@/modules/recommendations/recommendations-client';
import { loadUserRecommendationsPage } from '@/modules/recommendations/recommendations-query-loader.server';
import { getUserRecommendationsQueryOptions } from '@/modules/recommendations/use-user-recommendations';
import { getServerSession } from '@/platform/auth/get-server-session';
import { makeQueryClient } from '@/platform/react-query/query-client';
import { HomeFeedHeader } from '@/shared/components/home-feed-header';

export default async function RecommendationsPage() {
  const session = await getServerSession();
  const viewerUserId = session?.user.id;

  if (!viewerUserId) {
    return (
      <div className="relative min-h-svh flex-1 pb-6 md:min-h-auto">
        <HomeFeedHeader activeView="recommendations" />
        <main>
          <RecommendationsClient />
        </main>
      </div>
    );
  }

  const queryClient = makeQueryClient();
  await queryClient.prefetchInfiniteQuery(
    getUserRecommendationsQueryOptions(viewerUserId, () =>
      loadUserRecommendationsPage({ userId: viewerUserId, cursor: null })
    )
  );

  return (
    <div className="relative min-h-svh flex-1 pb-6 md:min-h-auto">
      <HomeFeedHeader
        activeView="recommendations"
        viewerUserId={viewerUserId}
      />
      <main>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <RecommendationsClient viewerUserId={viewerUserId} />
        </HydrationBoundary>
      </main>
    </div>
  );
}
