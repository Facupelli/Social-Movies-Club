'use client';

import { Check } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { Button } from '@/shared/ui/button';

export function WatchlistProviderFilter({ active }: { active: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function toggle() {
    const params = new URLSearchParams(searchParams.toString());
    if (active) {
      params.delete('providers');
    } else {
      params.set('providers', 'mine');
    }
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  }

  return (
    <Button
      aria-pressed={active}
      className="min-h-11 rounded-full border border-border bg-surface px-3.5 shadow-none transition-colors hover:bg-elevated hover:text-foreground aria-pressed:border-primary/50 aria-pressed:bg-primary-subtle aria-pressed:text-primary aria-pressed:hover:border-primary aria-pressed:hover:bg-primary-subtle"
      disabled={pending}
      onClick={toggle}
      size="sm"
      type="button"
      variant="ghost"
    >
      {active && <Check aria-hidden="true" className="size-4" />}
      En mis plataformas
    </Button>
  );
}
