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
    <div className="border-border border-b px-4 py-3 md:px-8 md:py-4">
      <p className="text-muted-foreground text-xs">
        {stepIndex + 1} de {STEP_ORDER.length}
      </p>
      <p className="font-semibold text-sm">{labels[STEP_ORDER[stepIndex]]}</p>
      <div className="mt-2 flex gap-1.5">
        {STEP_ORDER.map((slug, i) => (
          <div
            className={cn(
              'h-1 flex-1 rounded-full',
              i <= stepIndex ? 'bg-primary' : 'bg-muted'
            )}
            key={slug}
          />
        ))}
      </div>
    </div>
  );
}
