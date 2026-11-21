import { cn } from '@/shared/utilities/utils';

export const homeFeedViews = [
  { href: '/recommendations', label: 'Para vos', value: 'recommendations' },
  { href: '/app', label: 'Recientes', value: 'recent' },
] as const;

export type HomeFeedView = (typeof homeFeedViews)[number]['value'];

export const homeFeedHeaderLayout =
  'grid min-h-12 grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center px-4';

export const homeFeedTabsLayout = 'flex items-center gap-5 justify-self-center';

export function homeFeedTabClassName(isActive: boolean) {
  return cn(
    'relative flex min-h-10 items-center whitespace-nowrap px-0.5 font-medium text-muted-foreground text-sm transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary after:opacity-0 after:transition-opacity hover:text-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    isActive && 'text-foreground after:opacity-100'
  );
}
