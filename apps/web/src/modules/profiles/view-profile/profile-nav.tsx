'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props {
  userId: string;
}

const PROFILE_TABS = [
  { label: 'Calificaciones', suffix: '' },
  { label: 'Lista', suffix: '/watchlist' },
  { label: 'Siguiendo', suffix: '/following' },
];

const TRAILING_SLASH = /\/$/;

export default function ProfileNav({ userId }: Props) {
  const pathname = usePathname()?.replace(TRAILING_SLASH, '') ?? '';

  return (
    <nav
      aria-label="Secciones del perfil"
      className="grid grid-cols-3 border-border border-b"
    >
      {PROFILE_TABS.map(({ label, suffix }) => {
        const href = `/profile/${userId}${suffix}`;
        const isActive =
          pathname === href ||
          (suffix !== '' && pathname.startsWith(`${href}/`));

        return (
          <Link
            aria-current={isActive ? 'page' : undefined}
            className={clsx(
              'flex h-10 items-center justify-center border-b-2 text-center text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
              isActive
                ? 'border-primary font-semibold text-foreground'
                : 'border-transparent font-medium text-muted-foreground hover:text-foreground'
            )}
            href={href}
            key={href}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
