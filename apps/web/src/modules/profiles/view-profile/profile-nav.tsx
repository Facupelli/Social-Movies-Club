'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props {
  userId: string;
}

export default function ProfileNav({ userId }: Props) {
  const pathname = usePathname() || '';

  const isRatingsTab =
    pathname === `/profile/${userId}` || pathname === `/profile/${userId}/`;
  const isWatchlistTab = pathname.startsWith(`/profile/${userId}/watchlist`);
  const isFollowingTab = pathname.startsWith(`/profile/${userId}/following`);

  return (
    <div className="flex items-center gap-6 border-neutral-500 border-b pt-2">
      <Link
        className={clsx(
          isRatingsTab && 'border-accent-foreground border-b-3 font-bold',
          'pb-2'
        )}
        href={`/profile/${userId}`}
      >
        Calificaciones
      </Link>
      <Link
        className={clsx(
          isWatchlistTab && 'border-accent-foreground border-b-3 font-bold',
          'pb-2'
        )}
        href={`/profile/${userId}/watchlist`}
      >
        Lista
      </Link>
      <Link
        className={clsx(
          isFollowingTab && 'border-accent-foreground border-b-3 font-bold',
          'pb-2'
        )}
        href={`/profile/${userId}/following`}
      >
        Siguiendo
      </Link>
    </div>
  );
}
