import { HomePageSkeleton } from '@/modules/timeline/view-timeline/home-page-skeleton';
import { HomeFeedHeader } from '@/shared/components/home-feed-header';

export default function HomeLoading() {
  return (
    <div className="relative min-h-svh flex-1 pb-6 md:min-h-auto">
      <HomeFeedHeader activeView="recent" />
      <HomePageSkeleton />
    </div>
  );
}
