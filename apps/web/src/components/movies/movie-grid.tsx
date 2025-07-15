import { Children } from "react";

export function MovieGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 md:px-10 grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(150px,1fr))] md:[grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
      {Children.toArray(children).map((child, idx) => (
        // biome-ignore lint:reason
        <div key={idx}>{child}</div>
      ))}
    </div>
  );
}
