'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Bookmark, Home, Users2Icon } from 'lucide-react';
import Image from 'next/image';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getUserNotificationsCountQueryOptions } from '@/modules/notifications/count-unread/use-user-notifications-count';
import { authClient } from '@/platform/auth/auth-client';
import { clearPersonalizedQueries } from '@/platform/react-query/personalized-cache';
import { Button } from '@/shared/ui/button';
import SignInButton from './sign-in-button';

export function Nav() {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();

  const isHomeActive = pathname === '/';
  const isWatchlistActive = session?.user.id
    ? pathname.startsWith(`/profile/${session.user.id}/watchlist`)
    : false;
  const isUsersActive = pathname.startsWith('/users');
  const isNotificationsActive = pathname.startsWith('/notifications');

  const { data: notificationsCount } = useQuery(
    getUserNotificationsCountQueryOptions(session?.user.id)
  );

  const handleLogOut = async () => {
    await authClient.signOut();
    await clearPersonalizedQueries(queryClient);
    router.replace('/');
    router.refresh();
  };

  return (
    <nav className="fixed z-10 bottom-0 left-0 flex w-full flex-row justify-center bg-sidebar p-4 md:sticky md:top-0 md:h-screen md:w-[250px] md:flex-col md:p-8">
      <ul className="flex gap-6 md:gap-2 md:grid">
        <li>
          <Link className={getNavLinkClassName(isHomeActive)} href="/">
            <Home className={getNavIconClassName(isHomeActive)} />
            <span className="hidden md:block">Inicio</span>
          </Link>
        </li>

        <li>
          <Link
            className={getNavLinkClassName(isWatchlistActive)}
            href={
              session?.user.id ? `/profile/${session.user.id}/watchlist` : '#'
            }
            prefetch={true}
          >
            <Bookmark className={getNavIconClassName(isWatchlistActive)} />
            <span className="hidden md:block">Lista</span>
          </Link>
        </li>
        <li>
          <Link className={getNavLinkClassName(isUsersActive)} href="/users">
            <Users2Icon className={getNavIconClassName(isUsersActive)} />
            <span className="hidden md:block">Usuarios</span>
          </Link>
        </li>
        <li>
          <Link
            className={getNavLinkClassName(isNotificationsActive)}
            href="/notifications"
          >
            <div className="relative">
              {notificationsCount !== undefined && notificationsCount > 0 ? (
                <div className="absolute -right-2 -top-2 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-xs leading-4">
                  {notificationsCount > 99 ? '99+' : notificationsCount}
                </div>
              ) : null}
              <Bell className={getNavIconClassName(isNotificationsActive)} />
            </div>
            <span className="hidden md:block">Notificaciones</span>
          </Link>
        </li>
      </ul>

      <div className="mt-auto hidden md:block">
        {session ? (
          <div>
            <div className="flex items-center gap-2 pb-4">
              {session.user.image && (
                <div className="shrink-0 rounded-full bg-secondary-foreground">
                  <Image
                    alt={session.user.name}
                    className="size-[30px] rounded-full object-cover"
                    height={30}
                    src={session.user.image}
                    unoptimized
                    width={30}
                  />
                </div>
              )}
              <div className="text-sm">
                <p>{session.user.name}</p>
              </div>
            </div>
            <Button
              className="w-full justify-start"
              onClick={handleLogOut}
              type="button"
              variant="outline"
            >
              Salir
            </Button>
          </div>
        ) : (
          <SignInButton />
        )}
      </div>
    </nav>
  );
}

function getNavLinkClassName(isActive: boolean) {
  return clsx(
    'flex min-h-11 items-center justify-center gap-2 rounded-md px-3 py-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground md:justify-start',
    isActive && 'bg-sidebar-accent text-sidebar-accent-foreground'
  );
}

function getNavIconClassName(isActive: boolean) {
  return clsx('size-5 transition-colors', isActive && 'text-sidebar-primary');
}
