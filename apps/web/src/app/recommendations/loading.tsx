import { RecommendationsSkeleton } from '@/modules/recommendations/recommendations-skeleton';
import { HomeFeedHeader } from '@/shared/components/home-feed-header';

export default function RecommendationsLoading() {
  return (
    <div className="relative min-h-svh flex-1 pb-6 md:min-h-auto">
      <HomeFeedHeader activeView="recommendations" />
      <main>
        <RecommendationsSkeleton />
      </main>
    </div>
  );
}
