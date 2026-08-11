import { ProfileNavSkeleton, ProfileSkeleton } from '@/modules/profiles/view-profile/profile-skeleton';
import { ProfileRatingsSkeleton } from '@/modules/ratings/list-profile-ratings/profile-ratings-skeleton';
import { Skeleton } from '@/shared/ui/skeleton';

export default function ProfileLoading() {
  return (
    <div className="min-h-svh">
      <div className="px-2 py-2 md:px-10">
        <Skeleton className="size-6" />
      </div>

      <div className="px-4 md:px-10">
        <ProfileSkeleton />
        <ProfileNavSkeleton />
        <ProfileRatingsSkeleton />
      </div>
    </div>
  );
}
