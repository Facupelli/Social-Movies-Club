import { X } from 'lucide-react';
import Link from 'next/link';
import { NotificationListSkeleton } from '@/modules/notifications/list-notifications/notification-list-skeleton';
import { Skeleton } from '@/shared/ui/skeleton';

export default function NotificationsLoading() {
  return (
    <div className="min-h-svh py-6">
      <header className="flex items-center justify-between px-4 md:px-10">
        <Skeleton className="h-7 w-40" />
        <Link
          aria-label="Volver a Inicio"
          className="flex size-11 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href="/"
        >
          <X className="size-6" />
        </Link>
      </header>
      <div className="pt-4">
        <NotificationListSkeleton />
      </div>
    </div>
  );
}
