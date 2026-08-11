import Link from 'next/link';
import { NotificationsLink } from '@/modules/notifications/notifications-link';
import { cn } from '@/shared/utilities/utils';

type HomeFeedView = 'recommendations' | 'recent';

const views: ReadonlyArray<{
  href: string;
  label: string;
  value: HomeFeedView;
}> = [
  { href: '/recommendations', label: 'Para vos', value: 'recommendations' },
  { href: '/', label: 'Recientes', value: 'recent' },
];

export function HomeFeedHeader({
  activeView,
  viewerUserId,
}: {
  activeView: HomeFeedView;
  viewerUserId?: string;
}) {
  return (
    <header className="grid min-h-12 grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center px-4 md:px-10">
      <div aria-hidden="true" className="size-10" />
      <nav aria-label="Explorar contenido" className="justify-self-center">
        <div className="flex items-center gap-5">
          {views.map((view) => {
            const isActive = view.value === activeView;

            return (
              <Link
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex min-h-10 items-center px-0.5 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive && 'text-foreground'
                )}
                href={view.href}
                key={view.value}
              >
                {view.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-x-0 bottom-0 h-0.5 bg-primary transition-opacity',
                    isActive ? 'opacity-100' : 'opacity-0'
                  )}
                />
              </Link>
            );
          })}
        </div>
      </nav>
      <NotificationsLink viewerUserId={viewerUserId} />
    </header>
  );
}
