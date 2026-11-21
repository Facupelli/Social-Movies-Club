import Link from 'next/link';
import { NotificationsLink } from '@/modules/notifications/notifications-link';
import { cn } from '@/shared/utilities/utils';
import {
  type HomeFeedView,
  homeFeedHeaderLayout,
  homeFeedTabClassName,
  homeFeedTabsLayout,
  homeFeedViews,
} from './home-feed-header.styles';

export function HomeFeedHeader({
  activeView,
  viewerUserId,
}: {
  activeView: HomeFeedView;
  viewerUserId?: string;
}) {
  return (
    <header className={cn(homeFeedHeaderLayout, 'md:px-10')}>
      <div aria-hidden="true" className="size-10" />
      <nav aria-label="Explorar contenido" className={homeFeedTabsLayout}>
        {homeFeedViews.map(({ href, label, value }) => (
          <Link
            aria-current={value === activeView ? 'page' : undefined}
            className={homeFeedTabClassName(value === activeView)}
            href={href}
            key={value}
          >
            {label}
          </Link>
        ))}
      </nav>
      <NotificationsLink viewerUserId={viewerUserId} />
    </header>
  );
}
