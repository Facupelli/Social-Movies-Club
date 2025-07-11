import { Children } from 'react';

export function MovieList({ children }: { children: React.ReactNode }) {
  return (
    <div className="divide-y divide-accent">
      {Children.toArray(children).map((child, idx) => (
        // biome-ignore lint:reason
        <div className="py-4 first:pt-0 last:pb-0" key={idx}>
          {child}
        </div>
      ))}
    </div>
  );
}
