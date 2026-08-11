'use client';

import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { getUserNotificationsCountQueryOptions } from '@/modules/notifications/count-unread/use-user-notifications-count';

export function NotificationsLink({ viewerUserId }: { viewerUserId?: string }) {
  const { data: notificationsCount } = useQuery(
    getUserNotificationsCountQueryOptions(viewerUserId)
  );

  return (
    <Link
      aria-label={
        notificationsCount && notificationsCount > 0
          ? `Notificaciones (${notificationsCount} sin leer)`
          : 'Notificaciones'
      }
      className="relative flex size-10 items-center justify-center rounded-sm text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      href="/notifications"
    >
      <Bell className="size-6" />
      {notificationsCount && notificationsCount > 0 ? (
        <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-primary" />
      ) : null}
    </Link>
  );
}
