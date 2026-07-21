import clsx from 'clsx';
import { User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { NotificationListSkeleton } from '@/modules/notifications/list-notifications/notification-list-skeleton';
import { listNotifications } from '@/modules/notifications/list-notifications/list-notifications';
import { MarkNotificationsReadOnVisit } from '@/modules/notifications/mark-as-read/mark-notifications-read-on-visit';
import { getServerSession } from '@/platform/auth/get-server-session';
import { formatFeedItemTime } from '@/shared/utilities/utils';

export default async function NotificationsPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/');
  }

  return (
    <div className="min-h-svh py-6">
      <h1 className="px-2 font-bold md:px-10 md:text-xl">Notificaciones</h1>

      <div className="pt-4">
        <Suspense fallback={<NotificationListSkeleton />}>
          <NotificationList viewerUserId={session.user.id} />
        </Suspense>
      </div>
    </div>
  );
}

async function NotificationList({ viewerUserId }: { viewerUserId: string }) {
  const notifications = await listNotifications(viewerUserId, {
    includeRead: true,
  });

  return (
    <>
      <MarkNotificationsReadOnVisit viewerUserId={viewerUserId} />

      {notifications.data.length === 0 ? (
        <section className="border-y border-border px-4 py-12 text-center md:px-10">
          <h2 className="font-semibold">No tienes notificaciones</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Las novedades de las personas que sigues aparecerán aquí.
          </p>
        </section>
      ) : (
        <section className="flex flex-col divide-y divide-border">
          {notifications.data.map((notification, index) => (
            <Link
              className={clsx(
                'flex items-start gap-2 border-border px-2 py-4 first:border-t last:border-b md:gap-4 md:px-10'
              )}
              href={notification.actionUrl ?? '#'}
              key={notification.id}
              prefetch={index === 0}
            >
              <div>
                <User className="size-7" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between">
                  <div className="size-8 rounded-full bg-secondary-foreground">
                    {notification.actorImage ? (
                      <Image
                        alt="profile image"
                        className="size-8 rounded-full object-cover"
                        height={32}
                        src={notification.actorImage}
                        unoptimized
                        width={32}
                      />
                    ) : (
                      <div className="size-8 rounded-full bg-secondary-foreground">
                        <User />
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">
                      {formatFeedItemTime(notification.createdAt)}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="font-bold text-primary hover:underline">
                    {notification.actorUsername}
                  </span>{' '}
                  <span>{notification.title}</span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </>
  );
}
