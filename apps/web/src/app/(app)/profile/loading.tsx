import {
  ProfileNavSkeleton,
  ProfileSkeleton,
} from '@/modules/profiles/view-profile/profile-skeleton';
import { ProfileRatingsSkeleton } from '@/modules/ratings/list-profile-ratings/profile-ratings-skeleton';
import { Skeleton } from '@/shared/ui/skeleton';

export default function ProfileLoading() {
  return (
    <div className="min-h-svh">
      <div className="px-4 py-2">
        <div className="grid size-11 place-items-center">
          <Skeleton className="size-5" />
        </div>
      </div>

      <div className="px-4">
        <ProfileSkeleton />
        <ProfileNavSkeleton />
        <ProfileRatingsSkeleton />
      </div>
    </div>
  );
}
