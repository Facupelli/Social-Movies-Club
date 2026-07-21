import { NotificationListSkeleton } from '@/modules/notifications/list-notifications/notification-list-skeleton';
import { Skeleton } from '@/shared/ui/skeleton';

export default function NotificationsLoading() {
  return (
    <div className="min-h-svh py-6">
      <div className="px-2 md:px-10">
        <Skeleton className="h-7 w-40" />
      </div>
      <div className="pt-4">
        <NotificationListSkeleton />
      </div>
    </div>
  );
}
