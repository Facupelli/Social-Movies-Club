import { Children } from 'react';
import { cn } from '@/shared/utilities/utils';

export function MovieGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-6 md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]',
        className
      )}
    >
      {Children.toArray(children).map((child, idx) => (
        // biome-ignore lint:reason
        <div key={idx}>{child}</div>
      ))}
    </div>
  );
}
