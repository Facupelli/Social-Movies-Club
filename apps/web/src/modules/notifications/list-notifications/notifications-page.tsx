import clsx from 'clsx';
import { User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { listNotifications } from '@/modules/notifications/list-notifications/list-notifications';
import { MarkNotificationsReadOnVisit } from '@/modules/notifications/mark-as-read/mark-notifications-read-on-visit';
import { getServerSession } from '@/platform/auth/get-server-session';
import { formatFeedItemTime } from '@/shared/utilities/utils';

export default async function NotificationsPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/');
  }

  const notifications = await listNotifications(session.user.id, {
    includeRead: true,
  });

  return (
    <div className="py-6 min-h-svh">
      <MarkNotificationsReadOnVisit viewerUserId={session.user.id} />

      <h1 className="font-bold md:text-xl px-2 md:px-10">Notificaciones</h1>

      <section className="pt-4 flex flex-col divide-y divide-border ">
        {notifications.data.map((notification, index) => (
          <Link
            className={clsx(
              'flex gap-2 md:gap-4 items-start py-4 px-2 md:px-10 first:border-t border-border last:border-b'
            )}
            href={notification.actionUrl ?? '#'}
            key={notification.id}
            prefetch={index === 0}
          >
            <div>
              <User className="size-7" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex justify-between ">
                <div className="size-8 rounded-full bg-secondary-foreground">
                  {notification.actorImage ? (
                    <Image
                      alt="profile image"
                      className="rounded-full size-8 object-cover"
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
                  <span className="text-muted-foreground text-sm">
                    {formatFeedItemTime(notification.createdAt)}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-primary hover:underline font-bold">
                  {notification.actorUsername}
                </span>{' '}
                <span>{notification.title}</span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
