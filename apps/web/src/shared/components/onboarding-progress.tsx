'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/shared/utilities/utils';

const STEP_ORDER = ['username', 'ratings', 'people'];

type OnboardingProgressProps = {
  labels: Record<string, string>;
};

export function OnboardingProgress({ labels }: OnboardingProgressProps) {
  const pathname = usePathname();
  const currentStep = STEP_ORDER.findIndex((slug) =>
    pathname.endsWith(`/${slug}`)
  );
  const stepIndex = currentStep >= 0 ? currentStep : 0;

  return (
    <div className="shrink-0 border-border border-b px-4 py-4 md:px-8">
      <div className="flex items-baseline gap-2">
        <p className="text-sm text-muted-foreground">
          {stepIndex + 1} de {STEP_ORDER.length}
        </p>
        <p className="font-semibold text-base">
          {labels[STEP_ORDER[stepIndex]]}
        </p>
      </div>
      <div className="mt-3 flex gap-2">
        {STEP_ORDER.map((slug, i) => (
          <div
            className={cn(
              'h-1.5 flex-1 rounded-full',
              i <= stepIndex ? 'bg-primary' : 'bg-muted'
            )}
            key={slug}
          />
        ))}
      </div>
    </div>
  );
}
